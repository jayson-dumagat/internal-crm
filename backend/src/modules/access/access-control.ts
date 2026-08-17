import type {
  AccessPermission,
  AccessPolicySnapshot,
  DataScope,
  FieldRule,
  ResourceAssignments,
  ResourceKey,
} from "../../shared/types/access";

export type {
  AccessPermission,
  AccessPolicySnapshot,
  DataScope,
  FieldRule,
  ResourceAssignments,
  ResourceKey,
} from "../../shared/types/access";

export const accessResourceCatalog = [
  { key: "leads", label: "Leads" },
  { key: "companies", label: "Companies" },
  { key: "contacts", label: "Contacts" },
  { key: "tasks", label: "Tasks and events" },
  { key: "notes", label: "Notes" },
  { key: "activities", label: "Activities" },
] as const;

export const accessFieldCatalog = [
  { key: "companies.name", label: "Company name", sensitive: false },
  { key: "companies.industry", label: "Company industry", sensitive: false },
  { key: "companies.location", label: "Company location", sensitive: false },
  {
    key: "companies.employees",
    label: "Company employee range",
    sensitive: false,
  },
  { key: "companies.revenue", label: "Company revenue", sensitive: true },
  {
    key: "companies.contacts",
    label: "Associated company contacts",
    sensitive: true,
  },
  { key: "companies.website", label: "Company website", sensitive: false },
  { key: "companies.customerSince", label: "Customer since", sensitive: false },
  { key: "companies.status", label: "Company status", sensitive: false },
  { key: "companies.tags", label: "Company tags", sensitive: false },
  { key: "contacts.name", label: "Contact name", sensitive: false },
  { key: "contacts.email", label: "Contact email", sensitive: true },
  { key: "contacts.phone", label: "Contact phone", sensitive: true },
  { key: "contacts.company", label: "Contact company", sensitive: false },
  { key: "contacts.position", label: "Contact role", sensitive: false },
  {
    key: "contacts.relationshipLevel",
    label: "Relationship level",
    sensitive: false,
  },
  { key: "contacts.owner", label: "Relationship owner", sensitive: true },
  { key: "contacts.location", label: "Contact location", sensitive: true },
  {
    key: "contacts.preferences",
    label: "Investor preferences",
    sensitive: true,
  },
  { key: "contacts.tags", label: "Contact tags", sensitive: false },
  { key: "contacts.status", label: "Contact status", sensitive: false },
  {
    key: "contacts.lastActivity",
    label: "Contact last activity",
    sensitive: false,
  },
  { key: "leads.name", label: "Lead name", sensitive: false },
  { key: "leads.email", label: "Lead email", sensitive: true },
  { key: "leads.phone", label: "Lead phone", sensitive: true },
  { key: "leads.company", label: "Lead company", sensitive: false },
  { key: "leads.role", label: "Lead role", sensitive: false },
  { key: "leads.source", label: "Lead source", sensitive: false },
  { key: "leads.status", label: "Lead status", sensitive: false },
  {
    key: "leads.interestLevel",
    label: "Lead interest level",
    sensitive: false,
  },
  { key: "leads.owner", label: "Lead owner", sensitive: true },
  { key: "leads.assignedTo", label: "Lead assignee", sensitive: true },
  { key: "leads.address", label: "Lead address", sensitive: true },
  { key: "leads.revenue", label: "Lead revenue", sensitive: true },
  { key: "leads.dateCreated", label: "Lead created date", sensitive: false },
  { key: "tasks.title", label: "Task title", sensitive: false },
  { key: "tasks.type", label: "Task type", sensitive: false },
  { key: "tasks.status", label: "Task status", sensitive: false },
  { key: "tasks.priority", label: "Task priority", sensitive: false },
  { key: "tasks.schedule", label: "Task schedule", sensitive: true },
  { key: "tasks.description", label: "Task description", sensitive: true },
  { key: "tasks.assignee", label: "Task assignee", sensitive: true },
  { key: "tasks.lead", label: "Task linked lead", sensitive: true },
  { key: "notes.content", label: "Note content", sensitive: true },
  { key: "notes.relatedTo", label: "Note relationship", sensitive: true },
  { key: "notes.author", label: "Note author", sensitive: true },
  { key: "notes.title", label: "Note title", sensitive: false },
  { key: "notes.category", label: "Note category", sensitive: false },
  { key: "activities.actor", label: "Activity actor", sensitive: true },
  { key: "activities.target", label: "Activity target", sensitive: true },
  { key: "activities.action", label: "Activity action", sensitive: false },
  { key: "activities.category", label: "Activity category", sensitive: false },
  { key: "activities.outcome", label: "Activity outcome", sensitive: false },
  { key: "activities.details", label: "Activity details", sensitive: true },
  {
    key: "activities.ipAddress",
    label: "Activity IP address",
    sensitive: true,
  },
] as const;

export const accessScopeCatalog = [
  {
    key: "leads",
    label: "Leads",
    options: ["all", "assigned", "own"] as const,
  },
  { key: "contacts", label: "Contacts", options: ["all", "own"] as const },
  { key: "companies", label: "Companies", options: ["all", "own"] as const },
  {
    key: "tasks",
    label: "Tasks and events",
    options: ["all", "assigned", "own"] as const,
  },
  { key: "notes", label: "Notes", options: ["all", "own"] as const },
] as const;

export function toAccessPolicySnapshot(
  policy?: Partial<AccessPolicySnapshot> | null,
): AccessPolicySnapshot {
  return {
    allowedPermissions: policy?.allowedPermissions ?? [],
    deniedPermissions: policy?.deniedPermissions ?? [],
    fieldRules: policy?.fieldRules ?? {},
    dataScopes: policy?.dataScopes ?? {},
    resourceAssignments: policy?.resourceAssignments ?? {},
  };
}

export function canAccessRecord(
  request: { accessPolicy?: Partial<AccessPolicySnapshot> },
  resource: ResourceKey,
  recordId: string,
): boolean {
  const assignments = request.accessPolicy?.resourceAssignments?.[resource];
  return !assignments || assignments.includes(recordId);
}

export function hasResourceRestriction(
  request: { accessPolicy?: Partial<AccessPolicySnapshot> },
  resource: ResourceKey,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    request.accessPolicy?.resourceAssignments ?? {},
    resource,
  );
}

export function canViewField(
  request: {
    accessPolicy?: Partial<AccessPolicySnapshot>;
    session?: { user?: { roles?: string[]; permissions?: string[] } };
  },
  field: string,
): boolean {
  const rule = request.accessPolicy?.fieldRules?.[field];
  if (rule === "hidden") return false;
  const catalogEntry = accessFieldCatalog.find((entry) => entry.key === field);
  if (!catalogEntry?.sensitive) return true;
  return (
    request.session?.user?.permissions?.includes("data.sensitive.read") ?? false
  );
}

export function getDataScope(
  request: { accessPolicy?: Partial<AccessPolicySnapshot> },
  resource: string,
): DataScope {
  const configured = request.accessPolicy?.dataScopes?.[resource];
  if (configured === "own" || configured === "assigned") return configured;
  return "all";
}

export function firstHiddenInput(
  request: {
    accessPolicy?: Partial<AccessPolicySnapshot>;
    session?: { user?: { roles?: string[] } };
  },
  body: Record<string, unknown>,
  fields: Record<string, string>,
): string | undefined {
  return Object.entries(fields).find(
    ([input, field]) =>
      input in body &&
      body[input] !== undefined &&
      !canViewField(request, field),
  )?.[1];
}
