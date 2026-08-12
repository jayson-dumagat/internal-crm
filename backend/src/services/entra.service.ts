import crypto from "node:crypto";

import {
  ConfidentialClientApplication,
  CryptoProvider,
  type AuthorizationCodeRequest,
  type AuthorizationUrlRequest,
  type Configuration,
} from "@azure/msal-node";

import { entraConfig } from "../config/entra";
import { getDatabasePermissionsForRoles } from "../modules/access/access-permission.service";
import type {
  EntraAuthenticationResult,
  EntraAuthorizationResult,
  EntraIdTokenClaims,
  EntraUser,
} from "../modules/auth/auth.types";

class EntraService {
  private readonly client: ConfidentialClientApplication;
  private readonly cryptoProvider: CryptoProvider;

  constructor() {
    const configuration: Configuration = {
      auth: {
        clientId: entraConfig.clientId,
        authority: entraConfig.authority,
        clientSecret: entraConfig.clientSecret,
      },

      system: {
        loggerOptions: {
          piiLoggingEnabled: false,
          logLevel: 2,
          loggerCallback: (level, message, containsPii) => {
            if (containsPii) {
              return;
            }

            if (process.env.NODE_ENV !== "production") {
              console.debug(`[MSAL:${level}] ${message}`);
            }
          },
        },
      },
    };

    this.client = new ConfidentialClientApplication(configuration);
    this.cryptoProvider = new CryptoProvider();
  }

  /**
   * Generates the Microsoft Entra authorization URL.
   *
   * The returned state and codeVerifier must be stored in the
   * user's server-side session before the URL is returned.
   */
  async createAuthorizationUrl(): Promise<EntraAuthorizationResult> {
    const state = crypto.randomBytes(32).toString("base64url");

    const { verifier, challenge } =
      await this.cryptoProvider.generatePkceCodes();

    const request: AuthorizationUrlRequest = {
      scopes: [...entraConfig.scopes],
      redirectUri: entraConfig.redirectUri,
      responseMode: "query",
      state,
      codeChallenge: challenge,
      codeChallengeMethod: "S256",
      prompt: "select_account",
    };

    const authorizationUrl =
      await this.client.getAuthCodeUrl(request);

    this.validateMicrosoftAuthorizationUrl(authorizationUrl);

    return {
      authorizationUrl,
      state,
      codeVerifier: verifier,
    };
  }

  /**
   * Exchanges the authorization code received by the callback
   * for Microsoft identity tokens.
   */
  async exchangeAuthorizationCode(params: {
    code: string;
    codeVerifier: string;
  }): Promise<EntraAuthenticationResult> {
    const request: AuthorizationCodeRequest = {
      code: params.code,
      scopes: [...entraConfig.scopes],
      redirectUri: entraConfig.redirectUri,
      codeVerifier: params.codeVerifier,
    };

    const result = await this.client.acquireTokenByCode(request);

    if (!result?.account) {
      throw new Error(
        "Microsoft Entra authentication did not return an account.",
      );
    }

    const claims =
      result.idTokenClaims as EntraIdTokenClaims | undefined;

    if (!claims) {
      throw new Error(
        "Microsoft Entra authentication did not return ID-token claims.",
      );
    }

    const user = await this.mapClaimsToUser(
      claims,
      result.account.homeAccountId,
      result.account.username,
      result.account.name,
    );

    return {
      user,
      account: result.account,
      accessToken: result.accessToken || undefined,
      expiresOn: result.expiresOn,
    };
  }

  async getProfilePhoto(accessToken?: string): Promise<{
    data: Buffer;
    contentType: string;
  } | null> {
    if (!accessToken) return null;

    const response = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      console.warn(`Microsoft Graph profile photo request failed (${response.status}).`);
      return null;
    }

    return {
      data: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") ?? "image/jpeg",
    };
  }

  /**
   * Builds the Microsoft logout endpoint.
   */
  createLogoutUrl(): string {
    const logoutUrl = new URL(
      `${entraConfig.authority}/oauth2/v2.0/logout`,
    );

    logoutUrl.searchParams.set(
      "post_logout_redirect_uri",
      entraConfig.postLogoutRedirectUri,
    );

    return logoutUrl.toString();
  }

  private async mapClaimsToUser(
    claims: EntraIdTokenClaims,
    homeAccountId: string,
    accountUsername?: string,
    accountName?: string,
  ): Promise<EntraUser> {
    if (!claims.oid) {
      throw new Error(
        "The Microsoft ID token does not contain an oid claim.",
      );
    }

    if (!claims.tid) {
      throw new Error(
        "The Microsoft ID token does not contain a tid claim.",
      );
    }

    if (claims.tid !== entraConfig.tenantId) {
      throw new Error(
        "The authenticated account belongs to an unauthorized tenant.",
      );
    }

    const username =
      claims.preferred_username ??
      claims.email ??
      accountUsername ??
      "";

    const roles = Array.isArray(claims.roles) ? claims.roles : [];

    return {
      entraObjectId: claims.oid,
      tenantId: claims.tid,
      name: claims.name ?? accountName ?? username,
      email: claims.email ?? username,
      username,
      avatarUrl: null,
      roles,
      permissions: await getDatabasePermissionsForRoles(roles),
      homeAccountId,
    };
  }

  private validateMicrosoftAuthorizationUrl(url: string): void {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:") {
      throw new Error(
        "Microsoft authorization URL must use HTTPS.",
      );
    }

    if (parsedUrl.hostname !== "login.microsoftonline.com") {
      throw new Error(
        "Unexpected Microsoft authorization hostname.",
      );
    }
  }
}

export const entraService = new EntraService();
