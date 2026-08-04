import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { entraConfig } from "../../config/entra";
import { sessionCookieClearOptions } from "../../config/session";
import { entraService } from "../../services/entra.service";
import { AppDataSource } from "../../database/data-source";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import type { EntraUser } from "./auth.types";

const AUTH_REQUEST_MAX_AGE_MS = 10 * 60 * 1000;

export async function getEntraLoginUrl(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await entraService.createAuthorizationUrl();

    req.session.entraAuth = {
      state: result.state,
      codeVerifier: result.codeVerifier,
      createdAt: Date.now(),
    };

    await saveSession(req);

    res.status(200).json({
      authorizationUrl: result.authorizationUrl,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleEntraCallback(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const entraError = getQueryString(req.query.error);

    if (entraError) {
      const errorDescription =
        getQueryString(req.query.error_description) ??
        "Microsoft authentication was cancelled or failed.";

      await clearPendingAuth(req);

      res.redirect(
        buildFrontendCallbackUrl({
          success: false,
          error: entraError,
          message: errorDescription,
        }),
      );

      return;
    }

    const code = getQueryString(req.query.code);
    const returnedState = getQueryString(req.query.state);
    const pendingAuth = req.session.entraAuth;

    if (!code) {
      res.redirect(
        buildFrontendCallbackUrl({
          success: false,
          error: "authorization_code_missing",
          message: "Microsoft did not return an authorization code.",
        }),
      );

      return;
    }

    if (!pendingAuth || !returnedState) {
      await clearPendingAuth(req);

      res.redirect(
        buildFrontendCallbackUrl({
          success: false,
          error: "authentication_session_missing",
          message:
            "Your sign-in attempt is missing or expired. Please try again.",
        }),
      );

      return;
    }

    if (
      Date.now() - pendingAuth.createdAt >
      AUTH_REQUEST_MAX_AGE_MS
    ) {
      await clearPendingAuth(req);

      res.redirect(
        buildFrontendCallbackUrl({
          success: false,
          error: "authentication_request_expired",
          message: "Your sign-in attempt expired. Please try again.",
        }),
      );

      return;
    }

    const stateMatches = timingSafeEqual(
      returnedState,
      pendingAuth.state,
    );

    if (!stateMatches) {
      await clearPendingAuth(req);

      res.redirect(
        buildFrontendCallbackUrl({
          success: false,
          error: "invalid_authentication_state",
          message: "This sign-in attempt is no longer valid. Please try again.",
        }),
      );

      return;
    }

    const result =
      await entraService.exchangeAuthorizationCode({
        code,
        codeVerifier: pendingAuth.codeVerifier,
      });

    delete req.session.entraAuth;

    // Regenerate the session ID after authentication to prevent
    // session fixation, while preserving the authenticated user.
    const authenticatedUser = result.user;

    await syncAuthenticatedUser(authenticatedUser);

    await regenerateSession(req);

    req.session.user = authenticatedUser;

    await saveSession(req);

    res.redirect(
      buildFrontendCallbackUrl({
        success: true,
      }),
    );
  } catch (error) {
    console.error("Microsoft authentication callback failed", error);

    if (res.headersSent) {
      next(error);
      return;
    }

    await clearPendingAuth(req).catch((cleanupError) => {
      console.error("Failed to clear pending authentication", cleanupError);
    });

    res.redirect(
      buildFrontendCallbackUrl({
        success: false,
        error: "authentication_failed",
        message: "Microsoft authentication could not be completed. Please try again.",
      }),
    );
  }
}

async function syncAuthenticatedUser(authenticatedUser: EntraUser): Promise<void> {
  const repository = AppDataSource.getRepository(User);
  const user = await repository.findOne({
    where: {
      entraTenantId: authenticatedUser.tenantId,
      entraObjectId: authenticatedUser.entraObjectId,
    },
  });

  const values = {
    entraTenantId: authenticatedUser.tenantId,
    entraObjectId: authenticatedUser.entraObjectId,
    email: authenticatedUser.email || authenticatedUser.username,
    displayName: authenticatedUser.name,
    status: UserStatus.ACTIVE,
    isAccessEnabled: true,
    lastLoginAt: new Date(),
    lastSyncedAt: new Date(),
  };

  if (user) {
    Object.assign(user, values);
    await repository.save(user);
    return;
  }

  await repository.save(repository.create(values));
}

export function getCurrentSession(
  req: Request,
  res: Response,
): void {
  res.setHeader("Cache-Control", "no-store");

  if (!req.session.user) {
    res.status(401).json({
      authenticated: false,
      user: null,
    });

    return;
  }

  res.status(200).json({
    authenticated: true,
    user: req.session.user,
  });
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await destroySession(req);

    res.clearCookie("ccrms.sid", sessionCookieClearOptions);

    res.status(200).json({
      logoutUrl: entraService.createLogoutUrl(),
    });
  } catch (error) {
    next(error);
  }
}

function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function timingSafeEqual(
  receivedValue: string,
  storedValue: string,
): boolean {
  const received = Buffer.from(receivedValue);
  const stored = Buffer.from(storedValue);

  return (
    received.length === stored.length &&
    crypto.timingSafeEqual(received, stored)
  );
}

function buildFrontendCallbackUrl(params: {
  success: boolean;
  error?: string;
  message?: string;
}): string {
  const url = new URL(
    "/signin",
    entraConfig.frontendUrl,
  );

  if (params.success) {
    url.searchParams.set("login", "success");
  }

  if (params.error) {
    url.searchParams.set("error", params.error);
  }

  // Avoid placing sensitive token or account data in the URL.
  if (params.message) {
    url.searchParams.set(
      "message",
      params.message.slice(0, 300),
    );
  }

  return url.toString();
}

function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function clearPendingAuth(req: Request): Promise<void> {
  if (!req.session.entraAuth) {
    return;
  }

  delete req.session.entraAuth;
  await saveSession(req);
}
