import axios from "axios";
import { z } from "zod";
import { apiErrorSchema } from "../validations/api";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const result = apiErrorSchema.safeParse(error.response?.data);
    return result.success && result.data.message
      ? result.data.message
      : fallback;
  }

  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
