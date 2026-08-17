import { apiClient } from "./client";
import { getApiErrorMessage } from "./errors";
import {
  accessCatalogSchema,
  accessRolesResponseSchema,
  accessUsersResponseSchema,
  accessResourcesResponseSchema,
  singleResponse,
  type AccessCatalog,
  type AccessRole,
  type AccessUser,
  type AccessResources,
} from "../validations/api";

export type AccessPolicyInput = {
  allowedPermissions: string[];
  deniedPermissions: string[];
  fieldRules: Record<string, "visible" | "hidden">;
  dataScopes: Record<string, "all" | "assigned" | "own">;
  resourceAssignments: Record<string, string[]>;
};

export type AccessRolePermissionsInput = {
  permissionCodes: string[];
};

export async function getAccessCatalog(): Promise<AccessCatalog> {
  try {
    const response = await apiClient.get("/access/catalog");
    return accessCatalogSchema.parse(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to load access-control settings."),
    );
  }
}

export async function getAccessUsers(): Promise<AccessUser[]> {
  try {
    const response = await apiClient.get("/access/users");
    return accessUsersResponseSchema.parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load CRM users."));
  }
}

export async function getAccessRoles(): Promise<AccessRole[]> {
  try {
    const response = await apiClient.get("/access/roles");
    return accessRolesResponseSchema.parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load CRM roles."));
  }
}

export async function getAccessResources(): Promise<AccessResources> {
  try {
    const response = await apiClient.get("/access/resources");
    return accessResourcesResponseSchema.parse(response.data).data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load records for access assignments.",
      ),
    );
  }
}

export async function updateAccessUser(
  id: string,
  input: AccessPolicyInput,
): Promise<AccessUser> {
  try {
    const response = await apiClient.patch(
      `/access/users/${encodeURIComponent(id)}`,
      input,
    );
    return singleResponse(accessUsersResponseSchema.shape.data.element).parse(
      response.data,
    ).data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to update access policy."),
    );
  }
}

export async function updateAccessRole(
  id: string,
  input: AccessRolePermissionsInput,
): Promise<AccessRole> {
  try {
    const response = await apiClient.patch(
      `/access/roles/${encodeURIComponent(id)}`,
      input,
    );
    return accessRolesResponseSchema.shape.data.element.parse(
      response.data.data,
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to update role permissions."),
    );
  }
}
