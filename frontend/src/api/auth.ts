import { z } from "zod";
import { apiClient } from "./client";
import { getApiErrorMessage } from "./errors";

const authUserSchema = z.object({
  entraObjectId: z.string(),
  tenantId: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  roles: z.array(z.string()),
  homeAccountId: z.string(),
});

const sessionResponseSchema = z.object({
  authenticated: z.literal(true),
  user: authUserSchema,
});

const loginUrlResponseSchema = z.object({
  authorizationUrl: z
    .url()
    .refine((value) => {
      const url = new URL(value);

      return (
        url.protocol === "https:" &&
        url.hostname === "login.microsoftonline.com"
      );
    }, "The backend returned an invalid Microsoft authorization URL."),
});

const logoutResponseSchema = z.object({
  logoutUrl: z
    .url()
    .refine(
      (value) => new URL(value).hostname === "login.microsoftonline.com",
      "The backend returned an invalid Microsoft logout URL.",
    ),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

export async function getCurrentSession(): Promise<SessionResponse> {
  try {
    const response = await apiClient.get("/auth/session");

    return sessionResponseSchema.parse(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to verify your sign-in session."));
  }
}

export async function getMicrosoftLoginUrl(): Promise<string> {
  try {
    const response = await apiClient.get("/auth/login-url");
    const result = loginUrlResponseSchema.parse(response.data);

    return result.authorizationUrl;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to start Microsoft authentication."),
    );
  }
}

export async function logout(): Promise<string> {
  try {
    const response = await apiClient.post("/auth/logout");

    return logoutResponseSchema.parse(response.data).logoutUrl;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to sign out."));
  }
}
