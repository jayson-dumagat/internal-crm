import { getApiErrorMessage } from "./errors";
import { apiClient } from "./client";
import {
  activitySchema,
  companySchema,
  contactSchema,
  leadSchema,
  listResponse,
  noteSchema,
  singleResponse,
  taskSchema,
} from "../validations/api";
import type {
  ActivityRecord,
  CompanyRecord,
  ContactRecord,
  LeadRecord,
  NoteRecord,
  TaskRecord,
} from "../validations/api";
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
} from "../types/Crm";
export type {
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
} from "../types/Crm";
export type {
  ActivityRecord,
  CompanyRecord,
  ContactRecord,
  LeadRecord,
  NoteRecord,
  TaskRecord,
} from "../validations/api";

export type CrmListQuery = Record<string, string | number | undefined>;

function currentListQuery(): CrmListQuery {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

export async function getCompanies(params: CrmListQuery = currentListQuery()): Promise<CompanyRecord[]> {
  try {
    const response = await apiClient.get("/companies", { params });
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

export async function getContacts(params: CrmListQuery = currentListQuery()): Promise<ContactRecord[]> {
  try {
    const response = await apiClient.get("/contacts", { params });
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
    // Let Axios/browser set the multipart boundary. Setting Content-Type
    // manually omits that boundary and causes Multer to reject the upload.
    const response = await apiClient.post(`/contacts/${id}/avatar`, formData);
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
    const response = await apiClient.post(`/companies/${id}/logo`, formData);
    return singleResponse(companySchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload company logo."));
  }
}

export async function uploadLeadAvatar(
  id: LeadRecord["id"],
  file: File,
): Promise<LeadRecord> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/leads/${id}/avatar`, formData);
    return singleResponse(leadSchema).parse(response.data).data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload lead image."));
  }
}

export async function getLeads(params: CrmListQuery = currentListQuery()): Promise<LeadRecord[]> {
  try {
    const response = await apiClient.get("/leads", { params });
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

export type LeadConversionResponse = {
  lead: LeadRecord;
  client: ContactRecord;
  createdClient: boolean;
  alreadyConverted: boolean;
};

export async function convertLeadToClient(
  id: LeadRecord["id"],
): Promise<LeadConversionResponse> {
  try {
    const response = await apiClient.post(`/leads/${id}/convert`);
    const data = response.data?.data;
    return {
      lead: leadSchema.parse(data?.lead),
      client: contactSchema.parse(data?.client),
      createdClient: Boolean(data?.createdClient),
      alreadyConverted: Boolean(data?.alreadyConverted),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to convert lead to client."));
  }
}

export async function deleteLead(id: LeadRecord["id"]): Promise<void> {
  try {
    await apiClient.delete(`/leads/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete lead."));
  }
}

export async function getActivities(params: CrmListQuery = currentListQuery()): Promise<ActivityRecord[]> {
  try {
    const response = await apiClient.get("/activities", { params });
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

export async function getNotes(params: CrmListQuery = currentListQuery()): Promise<NoteRecord[]> {
  try {
    const response = await apiClient.get("/notes", { params });
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

export async function getTasks(params: CrmListQuery = currentListQuery()): Promise<TaskRecord[]> {
  try {
    const response = await apiClient.get("/tasks", { params });
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
