import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAccessCatalog, getAccessResources, getAccessUsers, updateAccessUser, type AccessPolicyInput } from "../../api/access";
import { getCurrentSession } from "../../api/auth";
import { useAuth } from "../auth/useAuth";
import { authKeys } from "../auth/useAuthApi";

export const accessControlKeys = {
  all: ["access-control"] as const,
  catalog: () => [...accessControlKeys.all, "catalog"] as const,
  users: () => [...accessControlKeys.all, "users"] as const,
  resources: () => [...accessControlKeys.all, "resources"] as const,
};

export function useAccessCatalogQuery() {
  return useQuery({ queryKey: accessControlKeys.catalog(), queryFn: getAccessCatalog });
}

export function useAccessUsersQuery() {
  return useQuery({ queryKey: accessControlKeys.users(), queryFn: getAccessUsers });
}

export function useAccessResourcesQuery() {
  return useQuery({ queryKey: accessControlKeys.resources(), queryFn: getAccessResources });
}

export function useUpdateAccessUser() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AccessPolicyInput }) => updateAccessUser(id, input),
    onSuccess: async (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.users() });
      queryClient.invalidateQueries({ queryKey: ["crm-directory"] });

      // Re-read the server session immediately. This updates the global
      // permission provider without requiring a logout/login cycle.
      const session = await queryClient.fetchQuery({
        queryKey: authKeys.session(),
        queryFn: getCurrentSession,
        staleTime: 0,
      });
      setUser(session.user);
      queryClient.setQueryData(authKeys.session(), session);
      queryClient.setQueryData<Awaited<ReturnType<typeof getAccessUsers>>>(
        accessControlKeys.users(),
        (users) => users?.map((user) => user.id === updatedUser.id ? updatedUser : user),
      );
    },
  });
}
