import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskColor1764800900000 implements MigrationInterface {
  name = "AddTaskColor1764800900000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS color varchar(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tasks DROP COLUMN IF EXISTS color`);
  }
}
