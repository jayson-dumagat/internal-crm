import type { ReactNode } from "react";

import { usePermission, type PermissionField } from "../../context/PermissionContext";
import type { AccessPermission } from "../../config/rbac";

export function Can({ permission, fallback = null, children }: { permission: AccessPermission; fallback?: ReactNode; children: ReactNode }) {
  return usePermission().can(permission) ? children : fallback;
}

export function CanField({ field, fallback = null, children }: { field: PermissionField; fallback?: ReactNode; children: ReactNode }) {
  return usePermission().canViewField(field) ? children : fallback;
}
