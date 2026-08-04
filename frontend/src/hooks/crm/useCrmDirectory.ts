import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCompany,
  createContact,
  deleteCompany,
  deleteContact,
  getCompanies,
  getContacts,
  updateCompany,
  updateContact,
  type CreateCompanyInput,
  type CreateContactInput,
  type UpdateCompanyInput,
  type UpdateContactInput,
} from "../../api/crm";
import { getUsers } from "../../api/users";

export const crmDirectoryKeys = {
  all: ["crm-directory"] as const,
  companies: () => [...crmDirectoryKeys.all, "companies"] as const,
  contacts: () => [...crmDirectoryKeys.all, "contacts"] as const,
  users: () => [...crmDirectoryKeys.all, "users"] as const,
};

export function useCompaniesQuery() {
  return useQuery({
    queryKey: crmDirectoryKeys.companies(),
    queryFn: getCompanies,
  });
}

export function useContactsQuery() {
  return useQuery({
    queryKey: crmDirectoryKeys.contacts(),
    queryFn: getContacts,
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: crmDirectoryKeys.users(),
    queryFn: getUsers,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyInput) => createCompany(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() }),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string | number; input: UpdateCompanyInput }) => updateCompany(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string | number; input: UpdateContactInput }) => updateContact(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
    },
  });
}
