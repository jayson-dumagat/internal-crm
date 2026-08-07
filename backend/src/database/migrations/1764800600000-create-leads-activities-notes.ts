import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLeadsActivitiesNotes1764800600000 implements MigrationInterface {
  name = "CreateLeadsActivitiesNotes1764800600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE lead_status_enum AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost')`);
    await queryRunner.query(`CREATE TYPE lead_interest_level_enum AS ENUM ('low', 'medium', 'high')`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name varchar(150) NOT NULL,
        last_name varchar(150) NOT NULL,
        avatar_url text,
        email varchar(320) NOT NULL,
        phone varchar(50),
        job_title varchar(200),
        company_name varchar(255),
        annual_revenue numeric(18,2),
        source varchar(150),
        status lead_status_enum NOT NULL DEFAULT 'new',
        interest_level lead_interest_level_enum NOT NULL DEFAULT 'low',
        address_line_1 varchar(255),
        address_line_2 varchar(255),
        city varchar(150),
        state_province varchar(150),
        postal_code varchar(30),
        country varchar(100),
        last_activity_at timestamptz,
        organization_id uuid,
        pipeline_id uuid,
        pipeline_stage_id varchar(100),
        pipeline_position integer NOT NULL DEFAULT 0,
        pipeline_progress smallint NOT NULL DEFAULT 0,
        entered_stage_at timestamptz,
        owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        assigned_to_id uuid REFERENCES users(id) ON DELETE SET NULL,
        created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        updated_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_leads_pipeline_progress CHECK (pipeline_progress >= 0 AND pipeline_progress <= 100)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_assigned_to_id ON leads(assigned_to_id)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        actor_id uuid,
        actor_name varchar(255) NOT NULL,
        actor_avatar_url text,
        action text NOT NULL,
        target text NOT NULL,
        category varchar(40) NOT NULL,
        outcome varchar(20) NOT NULL,
        ip_address varchar(100),
        details text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_activities_tenant_created_at ON activities(tenant_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        content_html text,
        category varchar(40) NOT NULL,
        related_to varchar(255),
        author_id uuid,
        author_name varchar(255) NOT NULL,
        author_avatar_url text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notes_tenant_updated_at ON notes(tenant_id, updated_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notes`);
    await queryRunner.query(`DROP TABLE IF EXISTS activities`);
    await queryRunner.query(`DROP TABLE IF EXISTS leads`);
    await queryRunner.query(`DROP TYPE IF EXISTS lead_interest_level_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS lead_status_enum`);
  }
}
