import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskKind1764801000000 implements MigrationInterface {
  name = "AddTaskKind1764801000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS kind varchar(20) NOT NULL DEFAULT 'task'
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_kind ON tasks(kind)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_kind`);
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS kind`);
  }
}
