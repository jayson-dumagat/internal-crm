import { z } from "zod";

const idSchema = z.union([z.string(), z.number()]);

export const companySchema = z.object({
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

export const contactSchema = z.object({
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

export const leadSchema = z.object({
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

export const activitySchema = z.object({
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

export const noteSchema = z.object({
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

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  kind: z.enum(["task", "event"]).default("task"),
  type: z.string(),
  status: z.enum(["not-started", "in-progress", "completed", "overdue", "blocked"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  color: z.string().nullable().optional(),
  startAt: z.string().nullable(),
  dueAt: z.string().nullable(),
  reminderAt: z.string().nullable(),
  leadId: z.string().nullable(),
  lead: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  assignee: z.object({ id: z.string(), name: z.string(), avatar: z.string().nullable() }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const authUserSchema = z.object({
  entraObjectId: z.string(),
  tenantId: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable().optional(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  homeAccountId: z.string(),
});

export const sessionResponseSchema = z.object({
  authenticated: z.literal(true),
  user: authUserSchema,
});

export const loginUrlResponseSchema = z.object({
  authorizationUrl: z
    .url()
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "login.microsoftonline.com";
    }, "The backend returned an invalid Microsoft authorization URL."),
});

export const logoutResponseSchema = z.object({
  logoutUrl: z
    .url()
    .refine((value) => new URL(value).hostname === "login.microsoftonline.com", "The backend returned an invalid Microsoft logout URL."),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  isCurrentUser: z.boolean(),
});

export const usersResponseSchema = z.object({ data: z.array(userSchema) });

export const apiErrorSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
});

export const listResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ data: z.array(schema) });

export const singleResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ data: schema });

export type AuthUser = z.infer<typeof authUserSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type UserRecord = z.infer<typeof userSchema>;
export type CompanyRecord = z.infer<typeof companySchema>;
export type ContactRecord = z.infer<typeof contactSchema>;
export type LeadRecord = z.infer<typeof leadSchema>;
export type ActivityRecord = z.infer<typeof activitySchema>;
export type NoteRecord = z.infer<typeof noteSchema>;
export type TaskRecord = z.infer<typeof taskSchema>;
