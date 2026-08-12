import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyContactTenantIds1764801400000 implements MigrationInterface {
  name = "AddCompanyContactTenantIds1764801400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS tenant_id varchar(150)");
    await queryRunner.query("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id varchar(150)");
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies (tenant_id)");
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts (tenant_id)");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP INDEX IF EXISTS idx_contacts_tenant_id");
    await queryRunner.query("DROP INDEX IF EXISTS idx_companies_tenant_id");
    await queryRunner.query("ALTER TABLE contacts DROP COLUMN IF EXISTS tenant_id");
    await queryRunner.query("ALTER TABLE companies DROP COLUMN IF EXISTS tenant_id");
  }
}
