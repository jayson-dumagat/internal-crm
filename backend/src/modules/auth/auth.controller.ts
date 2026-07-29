import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { entraConfig } from "../../config/entra";
import { entraService } from "../../services/entra.service";

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
      res.status(400).json({
        error: "authorization_code_missing",
        message: "Microsoft did not return an authorization code.",
      });

      return;
    }

    if (!pendingAuth || !returnedState) {
      res.status(400).json({
        error: "authentication_session_missing",
        message: "The authentication session is missing or expired.",
      });

      return;
    }

    if (
      Date.now() - pendingAuth.createdAt >
      AUTH_REQUEST_MAX_AGE_MS
    ) {
      delete req.session.entraAuth;

      res.status(400).json({
        error: "authentication_request_expired",
        message: "The authentication request has expired.",
      });

      return;
    }

    const stateMatches = timingSafeEqual(
      returnedState,
      pendingAuth.state,
    );

    if (!stateMatches) {
      delete req.session.entraAuth;

      res.status(400).json({
        error: "invalid_authentication_state",
        message: "The authentication state is invalid.",
      });

      return;
    }

    const result =
      await entraService.exchangeAuthorizationCode({
        code,
        codeVerifier: pendingAuth.codeVerifier,
      });

    req.session.user = result.user;
    delete req.session.entraAuth;

    // Regenerate the session ID after authentication to prevent
    // session fixation, while preserving the authenticated user.
    const authenticatedUser = result.user;

    await regenerateSession(req);

    req.session.user = authenticatedUser;

    await saveSession(req);

    res.redirect(
      buildFrontendCallbackUrl({
        success: true,
      }),
    );
  } catch (error) {
    next(error);
  }
}

export function getCurrentSession(
  req: Request,
  res: Response,
): void {
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

    res.clearCookie("ccrms.sid", {
      httpOnly: true,
      secure: entraConfig.redirectUri.startsWith("https://"),
      sameSite: "lax",
    });

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
    params.success ? "/dashboard" : "/signin",
    entraConfig.frontendUrl,
  );

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
