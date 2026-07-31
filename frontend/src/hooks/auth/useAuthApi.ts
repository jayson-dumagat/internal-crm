import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentSession,
  getMicrosoftLoginUrl,
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
}) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getCurrentSession,
    retry: false,
    staleTime: options?.staleTime ?? 30_000,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.removeQueries({ queryKey: authKeys.all }),
  });
}

