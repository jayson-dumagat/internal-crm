import type { MigrationInterface, QueryRunner } from "typeorm";

const resources = ["leads", "contacts", "companies", "tasks", "notes", "activities"];

export class AddImportExportPermissions1764801700000 implements MigrationInterface {
  name = "AddImportExportPermissions1764801700000";

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const resource of resources) {
      for (const action of ["import", "export"]) {
        const code = `${resource}.${action}`;
        await queryRunner.query(
          "INSERT INTO permissions (code, name, description) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING",
          [code, `${resource[0].toUpperCase()}${resource.slice(1)} / ${action}`, `Allows ${action}ing ${resource}.`],
        );
      }
    }
    for (const role of ["CRM.Admin", "Admin"]) {
      for (const resource of resources) {
        for (const action of ["import", "export"]) {
          await queryRunner.query(
            `INSERT INTO role_permissions (permission_id, role_id)
             SELECT p.id, r.id FROM permissions p, roles r
             WHERE p.code = $1 AND r.entra_app_role_value = $2
             ON CONFLICT DO NOTHING`,
            [`${resource}.${action}`, role],
          );
        }
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const resource of resources) {
      await queryRunner.query("DELETE FROM permissions WHERE code IN ($1, $2)", [`${resource}.import`, `${resource}.export`]);
    }
  }
}
