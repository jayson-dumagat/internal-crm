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
  contacts: z.array(z.object({ name: z.string(), avatar: z.string() })),
  website: z.string(),
  customerSince: z.string(),
  tags: z.array(z.string()),
  status: z.enum(["Active", "Prospect", "Dormant"]),
  lastActivity: z.string(),
  logoUrl: z.string().nullable().optional(),
});

const contactSchema = z.object({
  id: idSchema,
  company_id: z.string().nullable().optional(),
  user: z.object({ image: z.string(), name: z.string() }),
  position: z.string(),
  company: z.object({ image: z.string(), name: z.string() }),
  relationship_level: z.enum(["High", "Medium", "Low"]),
  contact: z.object({ email: z.string(), phone: z.string() }),
  owner: z.object({ image: z.string(), name: z.string() }),
  location: z.string(),
  status: z.enum(["Customer", "Prospect", "KYC Pending", "Dormant", "Closed"]),
  last_activity: z.string(),
  type_of_client: z.string().nullable().optional(),
  risk_profile: z.string().nullable().optional(),
  preferred_contact_method: z.string().nullable().optional(),
  relationship_owner_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const listResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ data: z.array(schema) });

const singleResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ data: schema });

export type CompanyRecord = z.infer<typeof companySchema>;
export type ContactRecord = z.infer<typeof contactSchema>;

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
