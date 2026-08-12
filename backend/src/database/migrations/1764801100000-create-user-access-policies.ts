import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAccessPolicies1764801100000 implements MigrationInterface {
  name = "CreateUserAccessPolicies1764801100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_access_policies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        entra_tenant_id uuid NOT NULL,
        entra_object_id uuid NOT NULL,
        allowed_permissions text[] NOT NULL DEFAULT '{}',
        denied_permissions text[] NOT NULL DEFAULT '{}',
        field_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
        data_scopes jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_access_policies_identity UNIQUE (entra_tenant_id, entra_object_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS user_access_policies");
  }
}
