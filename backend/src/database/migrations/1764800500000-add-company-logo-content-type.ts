import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyLogoContentType1764800500000 implements MigrationInterface {
  name = "AddCompanyLogoContentType1764800500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_content_type varchar(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS logo_content_type`,
    );
  }
}
