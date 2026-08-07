import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAvatarContentType1764800400000 implements MigrationInterface {
  name = "AddUserAvatarContentType1764800400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_content_type varchar(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS avatar_content_type`,
    );
  }
}
