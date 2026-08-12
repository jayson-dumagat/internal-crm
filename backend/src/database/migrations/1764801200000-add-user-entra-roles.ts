import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserEntraRoles1764801200000 implements MigrationInterface {
  name = "AddUserEntraRoles1764801200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS entra_roles text[] NOT NULL DEFAULT '{}'::text[]");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE users DROP COLUMN IF EXISTS entra_roles");
  }
}
