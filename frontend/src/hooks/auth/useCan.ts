import { usePermission, type PermissionResource } from "../../context/PermissionContext";
import type { AccessPermission } from "../../config/rbac";

const createResourceByPermission: Partial<Record<AccessPermission, PermissionResource>> = {
  "leads.create": "leads",
  "companies.create": "companies",
  "contacts.create": "contacts",
  "tasks.create": "tasks",
  "notes.create": "notes",
  "activities.create": "activities",
};

export function useCan(permission: AccessPermission): boolean {
  const permissions = usePermission();
  const resource = createResourceByPermission[permission];
  return permissions.can(permission) && (!resource || !permissions.isRecordRestricted(resource));
}

export function useHasCrmAccess(): boolean {
  return usePermission().canAny("dashboard.read", "leads.read", "contacts.read", "companies.read", "tasks.read", "notes.read", "activities.read");
}
