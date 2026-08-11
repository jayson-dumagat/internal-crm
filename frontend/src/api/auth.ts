import { apiClient } from "./client";
import { getApiErrorMessage } from "./errors";
import {
  loginUrlResponseSchema,
  logoutResponseSchema,
  sessionResponseSchema,
} from "../validations/api";
import type { SessionResponse } from "../validations/api";
export type { AuthUser, SessionResponse } from "../validations/api";

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
