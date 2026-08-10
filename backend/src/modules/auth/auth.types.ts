import type { AccountInfo, IdTokenClaims } from "@azure/msal-node";

export interface EntraIdTokenClaims extends IdTokenClaims {
  oid?: string;
  tid?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  roles?: string[];
}

export interface EntraUser {
  entraObjectId: string;
  tenantId: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  roles: string[];
  permissions: string[];
  homeAccountId: string;
}

export interface EntraAuthorizationResult {
  authorizationUrl: string;
  state: string;
  codeVerifier: string;
}

export interface EntraAuthenticationResult {
  user: EntraUser;
  account: AccountInfo;
  accessToken?: string;
  expiresOn?: Date | null;
}
