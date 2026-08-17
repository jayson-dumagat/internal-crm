import type { MigrationInterface, QueryRunner } from "typeorm";

const allPermissions = [
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
  "access.manage",
  "data.sensitive.read",
] as const;

const readOnlyPermissions = [
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
] as const;

const managerPermissions = [
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
  "data.sensitive.read",
] as const;

const advisorPermissions = allPermissions.filter(
  (permission) => permission !== "access.manage" && permission !== "pipelines.manage",
);

const operationsPermissions = allPermissions.filter(
  (permission) => permission !== "access.manage" && permission !== "data.sensitive.read",
);

const compliancePermissions = [
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
  "data.sensitive.read",
] as const;

const analystPermissions = readOnlyPermissions.filter(
  (permission) => permission !== "users.read",
);

type RoleDefinition = {
  entraRole: string;
  name: string;
  description: string;
  permissions: readonly string[];
};

const roleDefinitions: RoleDefinition[] = [
  {
    entraRole: "CRM.Admin",
    name: "CRM Administrator",
    description: "Full CRM access, including role and privacy policy administration.",
    permissions: allPermissions,
  },
  {
    entraRole: "Admin",
    name: "Administrator",
    description: "Legacy alias for the CRM administrator role.",
    permissions: allPermissions,
  },
  {
    entraRole: "CRM.Manager",
    name: "CRM Manager",
    description: "Manages client relationships and CRM workflows without changing access roles.",
    permissions: managerPermissions,
  },
  {
    entraRole: "Manager",
    name: "Manager",
    description: "Legacy alias for the CRM manager role.",
    permissions: managerPermissions,
  },
  {
    entraRole: "CRM.Advisor",
    name: "Relationship Advisor",
    description: "Works with assigned client relationships and CRM workflows.",
    permissions: advisorPermissions,
  },
  {
    entraRole: "Advisor",
    name: "Advisor",
    description: "Legacy alias for the relationship advisor role.",
    permissions: advisorPermissions,
  },
  {
    entraRole: "CRM.Operations",
    name: "Operations",
    description: "Maintains CRM records and workflows without sensitive investor data or access administration.",
    permissions: operationsPermissions,
  },
  {
    entraRole: "Operations",
    name: "Operations",
    description: "Legacy alias for the operations role.",
    permissions: operationsPermissions,
  },
  {
    entraRole: "CRM.Compliance",
    name: "Compliance",
    description: "Reviews CRM and audit information, including sensitive data, without editing records.",
    permissions: compliancePermissions,
  },
  {
    entraRole: "Compliance",
    name: "Compliance",
    description: "Legacy alias for the compliance role.",
    permissions: compliancePermissions,
  },
  {
    entraRole: "CRM.Analyst",
    name: "CRM Analyst",
    description: "Read-only access to operational CRM information for reporting and analysis.",
    permissions: analystPermissions,
  },
  {
    entraRole: "Analyst",
    name: "Analyst",
    description: "Legacy alias for the CRM analyst role.",
    permissions: analystPermissions,
  },
  {
    entraRole: "CRM.ReadOnly",
    name: "CRM Read Only",
    description: "Read-only CRM access without sensitive investor data.",
    permissions: readOnlyPermissions,
  },
  {
    entraRole: "ReadOnly",
    name: "Read Only",
    description: "Legacy alias for the CRM read-only role.",
    permissions: readOnlyPermissions,
  },
];

export class CustomizeAccessRoles1764801600000 implements MigrationInterface {
  name = "CustomizeAccessRoles1764801600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const role of roleDefinitions) {
      await queryRunner.query(
        `INSERT INTO roles (code, name, entra_app_role_value, description, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (entra_app_role_value)
         DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true`,
        [
          role.entraRole.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          role.name,
          role.entraRole,
          role.description,
        ],
      );

      await queryRunner.query(
        `DELETE FROM role_permissions
         WHERE role_id = (SELECT id FROM roles WHERE entra_app_role_value = $1)`,
        [role.entraRole],
      );

      for (const permission of role.permissions) {
        await queryRunner.query(
          `INSERT INTO role_permissions (permission_id, role_id)
           SELECT p.id, r.id
           FROM permissions p, roles r
           WHERE p.code = $1 AND r.entra_app_role_value = $2
           ON CONFLICT DO NOTHING`,
          [permission, role.entraRole],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const role of roleDefinitions) {
      await queryRunner.query(
        "DELETE FROM roles WHERE entra_app_role_value = $1",
        [role.entraRole],
      );
    }
  }
}
