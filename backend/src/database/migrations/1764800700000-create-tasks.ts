import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasks1764800700000 implements MigrationInterface {
  name = "CreateTasks1764800700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        type varchar(30) NOT NULL DEFAULT 'general',
        status varchar(30) NOT NULL DEFAULT 'todo',
        priority varchar(20) NOT NULL DEFAULT 'medium',
        start_at timestamptz,
        due_at timestamptz,
        completed_at timestamptz,
        reminder_at timestamptz,
        is_reminder_sent boolean NOT NULL DEFAULT false,
        assignee_id uuid,
        lead_id uuid,
        organization_id uuid,
        created_by_id uuid NOT NULL,
        completed_by_id uuid,
        updated_by_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON tasks(tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tasks`);
  }
}
