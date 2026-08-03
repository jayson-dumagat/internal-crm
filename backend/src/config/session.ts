import type { CookieOptions } from "express-session";

import { env } from "./env";

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.SESSION_COOKIE_SECURE,
  sameSite: env.SESSION_COOKIE_SAME_SITE,
  maxAge: env.SESSION_TTL_SECONDS * 1000,
};

export const sessionCookieClearOptions = {
  httpOnly: true,
  secure: env.SESSION_COOKIE_SECURE,
  sameSite: env.SESSION_COOKIE_SAME_SITE,
} as const;
