import crypto from "node:crypto";
import type { Request } from "express";

import { entraConfig } from "../../config/entra";

export function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function timingSafeEqual(receivedValue: string, storedValue: string): boolean {
  const received = Buffer.from(receivedValue);
  const stored = Buffer.from(storedValue);

  return received.length === stored.length && crypto.timingSafeEqual(received, stored);
}

export function buildFrontendCallbackUrl(params: {
  success: boolean;
  error?: string;
  message?: string;
}): string {
  const url = new URL("/signin", entraConfig.frontendUrl);

  if (params.success) url.searchParams.set("login", "success");
  if (params.error) url.searchParams.set("error", params.error);
  if (params.message) url.searchParams.set("message", params.message.slice(0, 300));

  return url.toString();
}

export function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

export function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

export function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export async function clearPendingAuth(req: Request): Promise<void> {
  if (!req.session.entraAuth) return;

  delete req.session.entraAuth;
  await saveSession(req);
}
