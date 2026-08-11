import { apiClient } from "./client";
import { getApiErrorMessage } from "./errors";
import { usersResponseSchema } from "../validations/api";
import type { UserRecord } from "../validations/api";
export type { UserRecord } from "../validations/api";

export async function getUsers(): Promise<UserRecord[]> {
  try {
    const response = await apiClient.get("/users");
    return usersResponseSchema.parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load relationship owners."));
  }
}
