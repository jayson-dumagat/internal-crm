import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCrmCompaniesAndContacts1764800000000 implements MigrationInterface {
  name = "CreateCrmCompaniesAndContacts1764800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        industry varchar(200),
        location varchar(255),
        employees varchar(50),
        revenue varchar(100),
        website varchar(500),
        customer_since date,
        tags text[] NOT NULL DEFAULT '{}'::text[],
        status varchar(30) NOT NULL DEFAULT 'Prospect',
        logo_url text,
        created_by_id varchar(150),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        role varchar(200),
        company_id uuid,
        company_name varchar(255),
        email varchar(320) NOT NULL,
        phone varchar(50),
        relationship_level varchar(20) NOT NULL DEFAULT 'Medium',
        relationship_owner varchar(255),
        location varchar(255),
        type_of_client varchar(80),
        risk_profile varchar(30),
        preferred_contact_method varchar(30),
        status varchar(30) NOT NULL DEFAULT 'Prospect',
        tags text[] NOT NULL DEFAULT '{}'::text[],
        avatar_url text,
        last_activity_at timestamptz,
        created_by_id varchar(150),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_companies_status ON companies (status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts (name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts (company_id)`);

    await queryRunner.query(`
      INSERT INTO companies (id, name, industry, location, employees, revenue, website, customer_since, tags, status)
      VALUES
        ('00000000-0000-0000-0000-000000000001', 'Northbridge Capital', 'Investment Management', 'Makati City, Philippines', '51-200', 'PHP 850M', 'northbridgecapital.com', '2021-03-12', ARRAY['VIP','Institutional'], 'Active'),
        ('00000000-0000-0000-0000-000000000002', 'Anderson Holdings', 'Diversified Holdings', 'Taguig City, Philippines', '201-500', 'PHP 2.4B', 'andersonholdings.com', '2022-09-08', ARRAY['High Value','Corporate'], 'Active'),
        ('00000000-0000-0000-0000-000000000003', 'Lumina Ventures', 'Venture Capital', 'Pasig City, Philippines', '11-50', 'PHP 320M', 'luminaventures.ph', '2024-01-19', ARRAY['Partner','Referral'], 'Prospect'),
        ('00000000-0000-0000-0000-000000000004', 'Martinez Family Office', 'Family Office', 'Bonifacio Global City', '11-50', 'PHP 1.1B', 'martinezfamilyoffice.com', '2023-06-15', ARRAY['HNW','Decision Maker'], 'Active'),
        ('00000000-0000-0000-0000-000000000005', 'Pacific Crest Partners', 'Financial Services', 'Cebu City, Philippines', '51-200', 'PHP 670M', 'pacificcrestpartners.com', '2020-11-02', ARRAY['Institutional'], 'Dormant'),
        ('00000000-0000-0000-0000-000000000006', 'Meridian Securities', 'Brokerage', 'Mandaluyong City, Philippines', '201-500', 'PHP 1.8B', 'meridiansecurities.ph', '2019-02-21', ARRAY['Strategic','Institutional'], 'Active')
      ON CONFLICT (id) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO contacts (id, name, role, company_id, company_name, email, phone, relationship_level, relationship_owner, location, status, last_activity_at)
      VALUES
        ('10000000-0000-0000-0000-000000000001', 'Abram Schleifer', 'Sales Assistant', '00000000-0000-0000-0000-000000000001', 'Northbridge Capital', 'abram@schleifer.com', '+63912887665', 'High', 'Kiko Pangilinan', 'Makati, Philippines', 'Customer', '2026-07-12'),
        ('10000000-0000-0000-0000-000000000002', 'Charlotte Anderson', 'Managing Director', '00000000-0000-0000-0000-000000000002', 'Anderson Holdings', 'charlotte@andersonholdings.com', '+63 917 555 0182', 'Medium', 'Mark Santos', 'Taguig, Philippines', 'KYC Pending', '2026-07-18'),
        ('10000000-0000-0000-0000-000000000003', 'Ethan Brown', 'Investor', '00000000-0000-0000-0000-000000000003', 'Lumina Ventures', 'ethan@email.com', '+63 917 555 0111', 'Low', 'Ana Dela Cruz', 'Quezon City, Philippines', 'Prospect', '2026-07-10')
      ON CONFLICT (id) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS contacts`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies`);
  }
}
