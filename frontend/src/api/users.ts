import { z } from "zod";

import { apiClient } from "./client";
import { getApiErrorMessage } from "./errors";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  isCurrentUser: z.boolean(),
});

const responseSchema = z.object({ data: z.array(userSchema) });

export type UserRecord = z.infer<typeof userSchema>;

export async function getUsers(): Promise<UserRecord[]> {
  try {
    const response = await apiClient.get("/users");
    return responseSchema.parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load relationship owners."));
  }
}
