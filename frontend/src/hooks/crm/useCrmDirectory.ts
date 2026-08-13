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
  uploadContactAvatar,
  uploadCompanyLogo,
  uploadLeadAvatar,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getActivities,
  createActivity,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../../api/crm";
import type {
  CreateActivityInput,
  CreateCompanyInput,
  CreateContactInput,
  CreateLeadInput,
  CreateNoteInput,
  CreateTaskInput,
  UpdateCompanyInput,
  UpdateContactInput,
  UpdateLeadInput,
  UpdateNoteInput,
  UpdateTaskInput,
} from "../../types/Crm";
import type { TaskStatus } from "../../types/Crm";
import { getUsers } from "../../api/users";

export const crmDirectoryKeys = {
  all: ["crm-directory"] as const,
  companies: () => [...crmDirectoryKeys.all, "companies"] as const,
  contacts: () => [...crmDirectoryKeys.all, "contacts"] as const,
  users: () => [...crmDirectoryKeys.all, "users"] as const,
  leads: () => [...crmDirectoryKeys.all, "leads"] as const,
  activities: () => [...crmDirectoryKeys.all, "activities"] as const,
  notes: () => [...crmDirectoryKeys.all, "notes"] as const,
  tasks: () => [...crmDirectoryKeys.all, "tasks"] as const,
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

export function useUploadContactAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string | number; file: File }) => uploadContactAvatar(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
    },
  });
}

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string | number; file: File }) => uploadCompanyLogo(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.companies() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.contacts() });
    },
  });
}

export function useUploadLeadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string | number; file: File }) => uploadLeadAvatar(String(id), file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useLeadsQuery() {
  return useQuery({ queryKey: crmDirectoryKeys.leads(), queryFn: getLeads });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string | number; input: UpdateLeadInput }) => updateLead(String(id), input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteLead(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useActivitiesQuery() {
  return useQuery({ queryKey: crmDirectoryKeys.activities(), queryFn: getActivities });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() }),
  });
}

export function useNotesQuery() {
  return useQuery({ queryKey: crmDirectoryKeys.notes(), queryFn: getNotes });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.notes() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string | number; input: UpdateNoteInput }) => updateNote(String(id), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.notes() }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteNote(String(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.notes() }),
  });
}

export function useTasksQuery() {
  return useQuery({ queryKey: crmDirectoryKeys.tasks(), queryFn: getTasks });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: crmDirectoryKeys.activities() });
    },
  });
}
