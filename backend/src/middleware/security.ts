import type { NextFunction, Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";

import { env } from "../config/env";
import { connectRedis, redisClient } from "../config/redis";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

const allowedOrigin = normalizeOrigin(env.FRONTEND_ORIGIN) ?? env.FRONTEND_ORIGIN;
const allowedOriginUrl = new URL(allowedOrigin);
const isDevTunnelOrigin = allowedOriginUrl.hostname.endsWith(".devtunnels.ms");
const rewrittenLocalOrigins = new Set([
  "http://localhost",
  "https://localhost",
  "http://127.0.0.1",
  "https://127.0.0.1",
]);

function createRedisRateLimitStore(prefix = env.REDIS_RATE_LIMIT_PREFIX): RedisStore {
  return new RedisStore({
    prefix,
    sendCommand: async (...args: string[]) => {
      await connectRedis();
      return redisClient.sendCommand(args) as Promise<RedisReply>;
    },
  });
}

function requestKey(req: Request): string {
  const ip = ipKeyGenerator(req.ip ?? "unknown");
  const userId = req.session.user?.entraObjectId;
  return `${ip}:${userId ?? "anonymous"}`;
}

function rateLimitResponse(
  _req: Request,
  res: Response,
  _next: NextFunction,
  options: { statusCode: number; windowMs: number },
): void {
  res.status(options.statusCode).json({
    success: false,
    message: "Too many requests. Please try again shortly.",
    code: "rate_limited",
    retryAfterSeconds: Math.ceil(options.windowMs / 1000),
  });
}

/** Shared Redis-backed limiter for every API request. */
export const apiRateLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  limit: env.API_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: requestKey,
  store: createRedisRateLimitStore(),
  handler: rateLimitResponse,
});

/** Tighter limiter for Entra authorization and callback endpoints. */
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
  store: createRedisRateLimitStore(`${env.REDIS_RATE_LIMIT_PREFIX}auth:`),
  handler: rateLimitResponse,
});

/**
 * Prevents browser-originated state-changing requests from another origin.
 * Requests without an Origin header are kept compatible with server-to-server
 * clients and health checks; browser requests send Origin automatically.
 */
export function requireTrustedOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!mutatingMethods.has(req.method)) {
    next();
    return;
  }

  const origin = normalizeOrigin(req.get("origin"));
  if (!origin) {
    next();
    return;
  }

  if (origin === allowedOrigin) {
    next();
    return;
  }

  // Microsoft Dev Tunnels may rewrite Origin to localhost before forwarding
  // a request to an HTTP origin. Only accept that rewrite when the request's
  // Referer still identifies this exact configured tunnel origin. This keeps
  // the CSRF check strict and avoids trusting arbitrary localhost origins.
  const refererOrigin = normalizeOrigin(req.get("referer"));
  const isTrustedDevTunnelRewrite =
    isDevTunnelOrigin &&
    rewrittenLocalOrigins.has(origin) &&
    refererOrigin === allowedOrigin;

  if (!isTrustedDevTunnelRewrite) {
    res.status(403).json({
      success: false,
      message: "The request origin is not trusted.",
      code: "untrusted_origin",
    });
    return;
  }

  next();
}

/** API responses contain user and authorization data; keep them out of caches. */
export function preventApiCaching(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  next();
}
