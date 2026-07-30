import axios from "axios";
import { z } from "zod";

const authApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/v1/auth`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

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

export type AuthUser = z.infer<typeof authUserSchema>;
type SessionResponse = z.infer<typeof sessionResponseSchema>;

export async function getCurrentSession(): Promise<SessionResponse> {
  try {
    const response = await authApi.get("/session");

    return sessionResponseSchema.parse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Your sign-in session could not be verified.");
    }

    throw new Error(
      error instanceof z.ZodError
        ? "The server returned an invalid sign-in session."
        : "Unable to verify your sign-in session.",
    );
  }
}

export async function getMicrosoftLoginUrl(): Promise<string> {
  try {
    const response = await authApi.get("/login-url");
    const result = loginUrlResponseSchema.parse(response.data);

    return result.authorizationUrl;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Unable to start Microsoft authentication.",
      );
    }

    throw error instanceof z.ZodError
      ? new Error(error.issues[0]?.message ?? "Invalid authentication response.")
      : error;
  }
}
