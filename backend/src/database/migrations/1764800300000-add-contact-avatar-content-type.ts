import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactAvatarContentType1764800300000 implements MigrationInterface {
  name = "AddContactAvatarContentType1764800300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS avatar_content_type varchar(100)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE contacts DROP COLUMN IF EXISTS avatar_content_type`);
  }
}
