import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCurrentSession,
  getMicrosoftLoginUrl,
  getMicrosoftLogoutUrl,
  logout,
} from "../../api/auth";

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export function useSessionQuery(options?: {
  enabled?: boolean;
  refetchOnMount?: boolean | "always";
  staleTime?: number;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getCurrentSession,
    retry: false,
    staleTime: options?.staleTime ?? 30_000,
    refetchInterval: options?.refetchInterval,
    refetchOnMount: options?.refetchOnMount ?? false,
    enabled: options?.enabled ?? true,
  });
}

export function useMicrosoftSignIn() {
  return useMutation({
    mutationFn: getMicrosoftLoginUrl,
    onSuccess: (authorizationUrl) => window.location.assign(authorizationUrl),
  });
}

export function useLogout() {
  const redirectToMicrosoftLogout = (logoutUrl: string) => {
    // Do not clear React auth state before this navigation. ProtectedRoute
    // could otherwise render /signin while the browser is still leaving for
    // Microsoft. The server session has already been destroyed, and the next
    // app load will establish the signed-out state.
    // replace() also prevents the authenticated CRM page from being restored
    // with the browser Back button.
    window.location.replace(logoutUrl);
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: (logoutUrl) => {
      redirectToMicrosoftLogout(logoutUrl);
    },
    onError: async () => {
      // If the session POST fails because the session already expired, still
      // send the user through Microsoft's logout endpoint instead of letting
      // the route guard redirect directly to /signin.
      try {
        const logoutUrl = await getMicrosoftLogoutUrl();
        redirectToMicrosoftLogout(logoutUrl);
      } catch {
        // Keep the current route if both logout requests fail so the user is
        // not silently redirected to the local sign-in page.
      }
    },
  });
}
