import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1764800100000 implements MigrationInterface {
  name = "CreateUsers1764800100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
          CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        entra_tenant_id uuid NOT NULL,
        entra_object_id uuid NOT NULL,
        email varchar(320),
        display_name varchar(255) NOT NULL,
        given_name varchar(150),
        family_name varchar(150),
        job_title varchar(150),
        department varchar(150),
        office_location varchar(255),
        avatar_url text,
        status user_status_enum NOT NULL DEFAULT 'active',
        is_access_enabled boolean NOT NULL DEFAULT true,
        last_login_at timestamptz,
        last_synced_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_users_entra_identity UNIQUE (entra_tenant_id, entra_object_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum`);
  }
}
