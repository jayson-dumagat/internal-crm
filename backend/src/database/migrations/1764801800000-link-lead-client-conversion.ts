import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Keeps the lead as the acquisition/history record while making the contact
 * the canonical client record after conversion. Each lead stores one
 * canonical contact link, while duplicate lead records may point to the same
 * client/contact without creating a second client.
 */
export class LinkLeadClientConversion1764801800000 implements MigrationInterface {
  name = "LinkLeadClientConversion1764801800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS converted_contact_id uuid,
      ADD COLUMN IF NOT EXISTS converted_at timestamptz
    `);

    await queryRunner.query(`
      ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS source_lead_id uuid
    `);

    // A client can be associated with more than one duplicate lead, so this
    // lookup index must not be unique. The source-lead index below remains
    // unique because one lead can only create one canonical contact.
    await queryRunner.query(`DROP INDEX IF EXISTS uq_leads_converted_contact_id`);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_converted_contact_id
      ON leads (converted_contact_id)
      WHERE converted_contact_id IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_source_lead_id
      ON contacts (source_lead_id)
      WHERE source_lead_id IS NOT NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_leads_converted_contact'
        ) THEN
          ALTER TABLE leads
          ADD CONSTRAINT fk_leads_converted_contact
          FOREIGN KEY (converted_contact_id) REFERENCES contacts(id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_contacts_source_lead'
        ) THEN
          ALTER TABLE contacts
          ADD CONSTRAINT fk_contacts_source_lead
          FOREIGN KEY (source_lead_id) REFERENCES leads(id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE contacts DROP CONSTRAINT IF EXISTS fk_contacts_source_lead
    `);
    await queryRunner.query(`
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS fk_leads_converted_contact
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_contacts_source_lead_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_converted_contact_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_leads_converted_contact_id`);
    await queryRunner.query(`ALTER TABLE contacts DROP COLUMN IF EXISTS source_lead_id`);
    await queryRunner.query(`
      ALTER TABLE leads
      DROP COLUMN IF EXISTS converted_contact_id,
      DROP COLUMN IF EXISTS converted_at
    `);
  }
}
