import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddResourceAssignments1764801300000 implements MigrationInterface {
  name = "AddResourceAssignments1764801300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE user_access_policies ADD COLUMN IF NOT EXISTS resource_assignments jsonb NOT NULL DEFAULT '{}'::jsonb");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE user_access_policies DROP COLUMN IF EXISTS resource_assignments");
  }
}
