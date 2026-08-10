import { useAuth } from "./useAuth";
import { hasAnyPermission, hasPermission, type AccessPermission } from "../../config/rbac";

export function useCan(permission: AccessPermission): boolean {
  const { user } = useAuth();
  return hasPermission(user, permission);
}

export function useHasCrmAccess(): boolean {
  const { user } = useAuth();
  return hasAnyPermission(user);
}

