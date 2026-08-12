import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSessionQuery } from "../../hooks/auth/useAuthApi";
import { useAuth } from "../../hooks/auth/useAuth";
import AccessDenied from "./AccessDenied";
import { hasAnyPermission, hasPermission, type AccessPermission } from "../../config/rbac";

interface ProtectedRouteProps {
  children: ReactNode;
  requireCrmAccess?: boolean;
  requiredPermission?: AccessPermission;
}

export default function ProtectedRoute({
  children,
  requireCrmAccess = false,
  requiredPermission,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { setUser, clearUser } = useAuth();

  const sessionQuery = useSessionQuery({
    refetchOnMount: "always",
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (sessionQuery.data) {
      setUser(sessionQuery.data.user);
    }
  }, [sessionQuery.data, setUser]);

  useEffect(() => {
    if (sessionQuery.isError) {
      clearUser();
    }
  }, [clearUser, sessionQuery.isError]);

  if (sessionQuery.isPending) {
    return (
      <div
        role="status"
        aria-label="Checking your session"
        className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"
      >
        <div className="flex flex-col items-center gap-3">
          <span
            aria-hidden="true"
            className="size-9 animate-spin rounded-full border-3 border-gray-200 border-t-brand-500 dark:border-gray-800 dark:border-t-brand-400"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ returnTo: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (requireCrmAccess && !hasAnyPermission(sessionQuery.data?.user)) {
    return <AccessDenied />;
  }

  if (
    requiredPermission &&
    !hasPermission(sessionQuery.data?.user, requiredPermission)
  ) {
    return <AccessDenied />;
  }

  return children;
}
