import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactOwnerId1764800200000 implements MigrationInterface {
  name = "AddContactOwnerId1764800200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship_owner_id varchar(150)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_contacts_relationship_owner_id ON contacts (relationship_owner_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_contacts_relationship_owner_id`);
    await queryRunner.query(`ALTER TABLE contacts DROP COLUMN IF EXISTS relationship_owner_id`);
  }
}
