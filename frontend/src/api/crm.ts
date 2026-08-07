import { z } from "zod";

import { getApiErrorMessage } from "./errors";
import { apiClient } from "./client";

const idSchema = z.union([z.string(), z.number()]);

const companySchema = z.object({
  id: idSchema,
  name: z.string(),
  industry: z.string(),
  location: z.string(),
  employees: z.string(),
  revenue: z.string(),
  contacts: z.array(z.object({ name: z.string(), avatar: z.string().nullable() })),
  website: z.string(),
  customerSince: z.string().nullable(),
  tags: z.array(z.string()),
  status: z.enum(["Active", "Prospect", "Dormant"]),
  lastActivity: z.string().nullable(),
  logoUrl: z.string().nullable().optional(),
});

const contactSchema = z.object({
  id: idSchema,
  company_id: z.string().nullable().optional(),
  user: z.object({ image: z.string().nullable(), name: z.string() }),
  position: z.string(),
  company: z.object({ image: z.string().nullable(), name: z.string() }),
  relationship_level: z.enum(["High", "Medium", "Low"]),
  contact: z.object({ email: z.string(), phone: z.string() }),
  owner: z.object({ image: z.string().nullable(), name: z.string() }),
  location: z.string(),
  status: z.enum(["Customer", "Prospect", "KYC Pending", "Dormant", "Closed"]),
  last_activity: z.string().nullable(),
  type_of_client: z.string().nullable().optional(),
  risk_profile: z.string().nullable().optional(),
  preferred_contact_method: z.string().nullable().optional(),
  relationship_owner_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const leadUserSchema = z.object({
  name: z.string(),
  avatar: z.string().nullable(),
});

const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  role: z.string(),
  lastActivity: z.string(),
  email: z.string(),
  phone: z.string(),
  company: z.string(),
  source: z.string(),
  annualRevenue: z.string().optional(),
  owner: leadUserSchema,
  status: z.enum(["New", "Contacted", "Qualified", "Converted", "Lost"]),
  interestLevel: z.enum(["High", "Medium", "Low"]),
  dateCreated: z.string(),
  address: z.string(),
  assignedTo: leadUserSchema,
});

const activitySchema = z.object({
  id: z.string(),
  actor: z.string(),
  avatar: z.string().nullable(),
  action: z.string(),
  target: z.string(),
  category: z.enum(["Authentication", "Client", "KYC", "Pipeline", "Task", "System"]),
  outcome: z.enum(["Success", "Warning", "Denied"]),
  timestamp: z.string(),
  ipAddress: z.string(),
  details: z.string(),
});

const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  contentHtml: z.string().nullable(),
  category: z.enum(["Client", "Follow-up", "Investment", "Internal"]),
  relatedTo: z.string(),
  author: z.string(),
  authorAvatar: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: z.string(),
  status: z.enum(["todo", "in-progress", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  startAt: z.string().nullable(),
  dueAt: z.string().nullable(),
  reminderAt: z.string().nullable(),
  leadId: z.string().nullable(),
  assignee: z.object({ id: z.string(), name: z.string(), avatar: z.string().nullable() }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const listResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ data: z.array(schema) });

const singleResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ data: schema });

export type CompanyRecord = z.infer<typeof companySchema>;
export type ContactRecord = z.infer<typeof contactSchema>;
export type LeadRecord = z.infer<typeof leadSchema>;
export type ActivityRecord = z.infer<typeof activitySchema>;
export type NoteRecord = z.infer<typeof noteSchema>;
export type TaskRecord = z.infer<typeof taskSchema>;

export type CreateCompanyInput = {
  name: string;
  industry?: string;
  location?: string;
  employees?: string;
  revenue?: string;
  website?: string;
  customerSince?: string;
  tags: string[];
  status: CompanyRecord["status"];
};

export type CreateContactInput = {
  name: string;
  role?: string;
  companyId?: string | null;
  email: string;
  phone?: string;
  relationshipLevel: ContactRecord["relationship_level"];
  relationshipOwner?: string;
  relationshipOwnerId?: string | null;
  location?: string;
  typeOfClient?: string;
  riskProfile?: string;
  preferredContactMethod?: string;
  status: ContactRecord["status"];
  tags: string[];
};

export type UpdateCompanyInput = Partial<CreateCompanyInput>;
export type UpdateContactInput = Partial<CreateContactInput>;

export type CreateLeadInput = {
  name: string;
  role?: string | null;
  email: string;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  annualRevenue?: string | null;
  status?: LeadRecord["status"];
  interestLevel?: LeadRecord["interestLevel"];
  address?: string | null;
  assignedToId?: string | null;
};

export type UpdateLeadInput = Partial<CreateLeadInput>;
export type CreateActivityInput = {
  action: string;
  target: string;
  category: ActivityRecord["category"];
  outcome: ActivityRecord["outcome"];
  ipAddress?: string | null;
  details?: string | null;
};
export type CreateNoteInput = {
  title: string;
  content: string;
  contentHtml?: string | null;
  category: NoteRecord["category"];
  relatedTo?: string | null;
};
export type UpdateNoteInput = Partial<CreateNoteInput>;
export type CreateTaskInput = {
  title: string;
  description?: string | null;
  type?: string;
  status?: TaskRecord["status"];
  priority?: TaskRecord["priority"];
  startAt?: string | null;
  dueAt?: string | null;
  reminderAt?: string | null;
  assigneeId?: string | null;
  leadId?: string | null;
};
export type UpdateTaskInput = Partial<CreateTaskInput>;

export async function getCompanies(): Promise<CompanyRecord[]> {
  try {
    const response = await apiClient.get("/companies");
    return listResponse(companySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load companies."));
  }
}

export async function createCompany(input: CreateCompanyInput): Promise<CompanyRecord> {
  try {
    const response = await apiClient.post("/companies", input);
    return singleResponse(companySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to add company."));
  }
}

export async function updateCompany(id: CompanyRecord["id"], input: UpdateCompanyInput): Promise<CompanyRecord> {
  try {
    const response = await apiClient.patch(`/companies/${id}`, input);
    return singleResponse(companySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update company."));
  }
}

export async function deleteCompany(id: CompanyRecord["id"]): Promise<void> {
  try {
    await apiClient.delete(`/companies/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete company."));
  }
}

export async function getContacts(): Promise<ContactRecord[]> {
  try {
    const response = await apiClient.get("/contacts");
    return listResponse(contactSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load contacts."));
  }
}

export async function createContact(input: CreateContactInput): Promise<ContactRecord> {
  try {
    const response = await apiClient.post("/contacts", input);
    return singleResponse(contactSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to add contact."));
  }
}

export async function updateContact(id: ContactRecord["id"], input: UpdateContactInput): Promise<ContactRecord> {
  try {
    const response = await apiClient.patch(`/contacts/${id}`, input);
    return singleResponse(contactSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update contact."));
  }
}

export async function deleteContact(id: ContactRecord["id"]): Promise<void> {
  try {
    await apiClient.delete(`/contacts/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete contact."));
  }
}

export async function uploadContactAvatar(
  id: ContactRecord["id"],
  file: File,
): Promise<ContactRecord> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/contacts/${id}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return singleResponse(contactSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload contact image."));
  }
}

export async function uploadCompanyLogo(
  id: CompanyRecord["id"],
  file: File,
): Promise<CompanyRecord> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/companies/${id}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return singleResponse(companySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload company logo."));
  }
}

export async function getLeads(): Promise<LeadRecord[]> {
  try {
    const response = await apiClient.get("/leads");
    return listResponse(leadSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load leads."));
  }
}

export async function createLead(input: CreateLeadInput): Promise<LeadRecord> {
  try {
    const response = await apiClient.post("/leads", input);
    return singleResponse(leadSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to add lead."));
  }
}

export async function updateLead(id: LeadRecord["id"], input: UpdateLeadInput): Promise<LeadRecord> {
  try {
    const response = await apiClient.patch(`/leads/${id}`, input);
    return singleResponse(leadSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update lead."));
  }
}

export async function deleteLead(id: LeadRecord["id"]): Promise<void> {
  try {
    await apiClient.delete(`/leads/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete lead."));
  }
}

export async function getActivities(): Promise<ActivityRecord[]> {
  try {
    const response = await apiClient.get("/activities");
    return listResponse(activitySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load activities."));
  }
}

export async function createActivity(input: CreateActivityInput): Promise<ActivityRecord> {
  try {
    const response = await apiClient.post("/activities", input);
    return singleResponse(activitySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to record activity."));
  }
}

export async function getNotes(): Promise<NoteRecord[]> {
  try {
    const response = await apiClient.get("/notes");
    return listResponse(noteSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load notes."));
  }
}

export async function createNote(input: CreateNoteInput): Promise<NoteRecord> {
  try {
    const response = await apiClient.post("/notes", input);
    return singleResponse(noteSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to add note."));
  }
}

export async function updateNote(id: NoteRecord["id"], input: UpdateNoteInput): Promise<NoteRecord> {
  try {
    const response = await apiClient.patch(`/notes/${id}`, input);
    return singleResponse(noteSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update note."));
  }
}

export async function deleteNote(id: NoteRecord["id"]): Promise<void> {
  try {
    await apiClient.delete(`/notes/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete note."));
  }
}

export async function getTasks(): Promise<TaskRecord[]> {
  try {
    const response = await apiClient.get("/tasks");
    return listResponse(taskSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load tasks."));
  }
}

export async function createTask(input: CreateTaskInput): Promise<TaskRecord> {
  try {
    const response = await apiClient.post("/tasks", input);
    return singleResponse(taskSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to add task."));
  }
}

export async function updateTask(id: TaskRecord["id"], input: UpdateTaskInput): Promise<TaskRecord> {
  try {
    const response = await apiClient.patch(`/tasks/${id}`, input);
    return singleResponse(taskSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update task."));
  }
}

export async function updateTaskStatus(id: TaskRecord["id"], status: TaskRecord["status"]): Promise<TaskRecord> {
  try {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return singleResponse(taskSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update task status."));
  }
}

export async function deleteTask(id: TaskRecord["id"]): Promise<void> {
  try {
    await apiClient.delete(`/tasks/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete task."));
  }
}
