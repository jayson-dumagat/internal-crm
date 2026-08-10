import type { ReactNode } from "react";

import AccessDenied from "./AccessDenied";
import { useAuth } from "../../hooks/auth/useAuth";
import { hasPermission, type AccessPermission } from "../../config/rbac";

export default function PermissionRoute({
  permission,
  children,
}: {
  permission: AccessPermission;
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return hasPermission(user, permission) ? children : <AccessDenied />;
}
