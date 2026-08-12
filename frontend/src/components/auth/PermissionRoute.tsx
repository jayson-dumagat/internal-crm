import type { ReactNode } from "react";

import AccessDenied from "./AccessDenied";
import { useAuth } from "../../hooks/auth/useAuth";
import { usePermission } from "../../context/PermissionContext";
import type { AccessPermission } from "../../config/rbac";

export default function PermissionRoute({
  permission,
  children,
}: {
  permission: AccessPermission;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const { can } = usePermission();

  if (!user) return null;

  return can(permission) ? children : <AccessDenied />;
}
