import type { MigrationInterface, QueryRunner } from "typeorm";

const permissions = [
  "dashboard.read", "calendar.read", "tasks.read", "tasks.create", "tasks.update", "tasks.delete", "tasks.status.update",
  "notes.read", "notes.create", "notes.update", "notes.delete", "inbox.read", "activities.read", "activities.create",
  "leads.read", "leads.create", "leads.update", "leads.delete", "contacts.read", "contacts.create", "contacts.update", "contacts.delete",
  "companies.read", "companies.create", "companies.update", "companies.delete", "pipelines.read", "pipelines.manage", "users.read",
  "access.manage", "data.sensitive.read",
];

const readOnly = [
  "dashboard.read", "calendar.read", "tasks.read", "notes.read", "inbox.read", "activities.read", "leads.read",
  "contacts.read", "companies.read", "pipelines.read", "users.read",
];

const advisor = permissions.filter((permission) => permission !== "access.manage" && permission !== "pipelines.manage");

export class CreateAccessPermissions1764801500000 implements MigrationInterface {
  name = "CreateAccessPermissions1764801500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(150) NOT NULL UNIQUE,
        name varchar(180) NOT NULL,
        description text
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(100) NOT NULL UNIQUE,
        name varchar(150) NOT NULL,
        entra_app_role_value varchar(150) NOT NULL UNIQUE,
        description text,
        is_active boolean NOT NULL DEFAULT true
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (permission_id, role_id)
      )
    `);

    for (const code of permissions) {
      await queryRunner.query(
        "INSERT INTO permissions (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING",
        [code, code.split(".").map((part) => part.replace(/[-_]/g, " ").replace(/^./, (value) => value.toUpperCase())).join(" / ")],
      );
    }

    const roleGrants: Record<string, string[]> = {
      "CRM.Admin": permissions,
      Admin: permissions,
      "CRM.Manager": permissions,
      Manager: permissions,
      "CRM.Advisor": advisor,
      Advisor: advisor,
      "CRM.ReadOnly": readOnly,
      ReadOnly: readOnly,
    };
    for (const [entraRole, grants] of Object.entries(roleGrants)) {
      await queryRunner.query(
        "INSERT INTO roles (code, name, entra_app_role_value) VALUES ($1, $2, $3) ON CONFLICT (entra_app_role_value) DO NOTHING",
        [entraRole.toLowerCase().replace(/[^a-z0-9]+/g, "-"), entraRole, entraRole],
      );
      for (const permission of grants) {
        await queryRunner.query(`
          INSERT INTO role_permissions (permission_id, role_id)
          SELECT p.id, r.id FROM permissions p, roles r
          WHERE p.code = $1 AND r.entra_app_role_value = $2
          ON CONFLICT DO NOTHING
        `, [permission, entraRole]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS role_permissions");
    await queryRunner.query("DROP TABLE IF EXISTS roles");
    await queryRunner.query("DROP TABLE IF EXISTS permissions");
  }
}
