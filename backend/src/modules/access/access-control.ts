export const accessPermissions = [
  "dashboard.read",
  "calendar.read",
  "tasks.read",
  "tasks.create",
  "tasks.update",
  "tasks.delete",
  "tasks.status.update",
  "notes.read",
  "notes.create",
  "notes.update",
  "notes.delete",
  "inbox.read",
  "activities.read",
  "activities.create",
  "leads.read",
  "leads.create",
  "leads.update",
  "leads.delete",
  "contacts.read",
  "contacts.create",
  "contacts.update",
  "contacts.delete",
  "companies.read",
  "companies.create",
  "companies.update",
  "companies.delete",
  "pipelines.read",
  "pipelines.manage",
  "users.read",
] as const;

export type AccessPermission = (typeof accessPermissions)[number];

const allPermissions = new Set<AccessPermission>(accessPermissions);

/**
 * These values must match the App role values configured in Microsoft Entra.
 * The short aliases make local migrations from a simple `Admin`/`Manager`
 * role less surprising while the CRM-prefixed values are the recommended
 * production configuration.
 */
const rolePermissions: Record<string, readonly AccessPermission[] | "all"> = {
  "CRM.Admin": "all",
  Admin: "all",
  "CRM.Manager": [
    ...accessPermissions,
  ],
  Manager: [
    ...accessPermissions,
  ],
  "CRM.Advisor": [
    "dashboard.read",
    "calendar.read",
    "tasks.read",
    "tasks.create",
    "tasks.update",
    "tasks.delete",
    "tasks.status.update",
    "notes.read",
    "notes.create",
    "notes.update",
    "notes.delete",
    "inbox.read",
    "activities.read",
    "activities.create",
    "leads.read",
    "leads.create",
    "leads.update",
    "leads.delete",
    "contacts.read",
    "contacts.create",
    "contacts.update",
    "contacts.delete",
    "companies.read",
    "companies.create",
    "companies.update",
    "companies.delete",
    "pipelines.read",
    "users.read",
  ],
  Advisor: [
    "dashboard.read",
    "calendar.read",
    "tasks.read",
    "tasks.create",
    "tasks.update",
    "tasks.delete",
    "tasks.status.update",
    "notes.read",
    "notes.create",
    "notes.update",
    "notes.delete",
    "inbox.read",
    "activities.read",
    "activities.create",
    "leads.read",
    "leads.create",
    "leads.update",
    "leads.delete",
    "contacts.read",
    "contacts.create",
    "contacts.update",
    "contacts.delete",
    "companies.read",
    "companies.create",
    "companies.update",
    "companies.delete",
    "pipelines.read",
    "users.read",
  ],
  "CRM.ReadOnly": [
    "dashboard.read",
    "calendar.read",
    "tasks.read",
    "notes.read",
    "inbox.read",
    "activities.read",
    "leads.read",
    "contacts.read",
    "companies.read",
    "pipelines.read",
    "users.read",
  ],
  ReadOnly: [
    "dashboard.read",
    "calendar.read",
    "tasks.read",
    "notes.read",
    "inbox.read",
    "activities.read",
    "leads.read",
    "contacts.read",
    "companies.read",
    "pipelines.read",
    "users.read",
  ],
};

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

const normalizedRolePermissions = new Map(
  Object.entries(rolePermissions).map(([role, permissions]) => [
    normalizeRole(role),
    permissions,
  ]),
);

export function getPermissionsForRoles(roles: readonly string[]): AccessPermission[] {
  const permissions = new Set<AccessPermission>();

  for (const role of roles) {
    const granted = normalizedRolePermissions.get(normalizeRole(role));
    if (!granted) continue;

    if (granted === "all") {
      return [...allPermissions];
    }

    granted.forEach((permission) => permissions.add(permission));
  }

  return [...permissions];
}

export function hasPermission(
  roles: readonly string[],
  permission: AccessPermission,
): boolean {
  return getPermissionsForRoles(roles).includes(permission);
}

