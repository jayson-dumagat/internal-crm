/** Permission codes are persisted in PostgreSQL and may be extended without
 * changing the application source. */
export type AccessPermission = string;

export type FieldRule = "visible" | "hidden";
export type DataScope = "all" | "assigned" | "own";
export type ResourceKey =
  | "leads"
  | "companies"
  | "contacts"
  | "tasks"
  | "notes"
  | "activities";
export type ResourceAssignments = Partial<Record<ResourceKey, string[]>>;

export interface AccessPolicySnapshot {
  allowedPermissions: string[];
  deniedPermissions: string[];
  fieldRules: Record<string, FieldRule>;
  dataScopes: Record<string, DataScope>;
  resourceAssignments: ResourceAssignments;
}
