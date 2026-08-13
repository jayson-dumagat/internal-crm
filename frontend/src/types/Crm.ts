import type {
  ActivityRecord,
  CompanyRecord,
  ContactRecord,
  LeadRecord,
  NoteRecord,
  TaskRecord,
} from "../validations/api";

export type TaskStatus = TaskRecord["status"];

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
  kind?: TaskRecord["kind"];
  type?: string;
  status?: TaskRecord["status"];
  priority?: TaskRecord["priority"];
  color?: string | null;
  startAt?: string | null;
  dueAt?: string | null;
  reminderAt?: string | null;
  assigneeId?: string | null;
  leadId?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
