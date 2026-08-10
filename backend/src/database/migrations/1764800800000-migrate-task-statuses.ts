import type { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateTaskStatuses1764800800000 implements MigrationInterface {
  name = "MigrateTaskStatuses1764800800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE tasks SET status = 'not_started' WHERE status = 'todo'`);
    await queryRunner.query(`UPDATE tasks SET status = 'blocked' WHERE status = 'cancelled'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE tasks SET status = 'todo' WHERE status = 'not_started'`);
    await queryRunner.query(`UPDATE tasks SET status = 'cancelled' WHERE status = 'blocked'`);
  }
}
