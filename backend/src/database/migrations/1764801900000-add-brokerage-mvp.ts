import type { MigrationInterface, QueryRunner } from "typeorm";

const permissions = [
  "brokerageAccounts.read", "brokerageAccounts.create", "brokerageAccounts.update", "brokerageAccounts.snapshot.read",
  "kyc.read", "kyc.create", "kyc.update", "kyc.review",
  "suitability.read", "suitability.create", "suitability.update",
  "documents.read", "documents.create", "documents.download",
  "compliance.read", "compliance.create", "compliance.update",
  "communications.read", "communications.create",
];

const tables = [
  `CREATE TABLE IF NOT EXISTS brokerage_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
    account_number text NOT NULL, account_type varchar(20) NOT NULL DEFAULT 'cash',
    status varchar(30) NOT NULL DEFAULT 'pending', opened_at date, approved_at date,
    assigned_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    funding_status varchar(30) NOT NULL DEFAULT 'not_funded', external_account_id varchar(255),
    contact_id uuid, company_id uuid, created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS kyc_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, contact_id uuid, company_id uuid, account_id uuid,
    status varchar(30) NOT NULL DEFAULT 'pending', identity_verification varchar(30) NOT NULL DEFAULT 'pending',
    beneficial_owners jsonb NOT NULL DEFAULT '[]', authorized_representatives jsonb NOT NULL DEFAULT '[]',
    source_of_funds varchar(500), purpose_of_account varchar(500), pep_status varchar(30) NOT NULL DEFAULT 'not_started',
    sanctions_status varchar(30) NOT NULL DEFAULT 'not_started', missing_documents text[] NOT NULL DEFAULT '{}', expired_documents text[] NOT NULL DEFAULT '{}',
    enhanced_due_diligence boolean NOT NULL DEFAULT false, next_review_at date, assigned_reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
    created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS kyc_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, case_id uuid NOT NULL REFERENCES kyc_cases(id) ON DELETE CASCADE,
    reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, decision varchar(30) NOT NULL, notes text, created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS suitability_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, contact_id uuid, company_id uuid, account_id uuid,
    investment_objective varchar(255), investment_horizon varchar(100), trading_experience varchar(100), product_knowledge varchar(100),
    income_range varchar(100), net_worth_range varchar(100), liquidity_needs varchar(255), preferred_securities text[] NOT NULL DEFAULT '{}',
    risk_profile varchar(30), reviewed_at date, approver_id uuid REFERENCES users(id) ON DELETE SET NULL,
    status varchar(30) NOT NULL DEFAULT 'pending', created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS brokerage_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, file_name varchar(255) NOT NULL, category varchar(40) NOT NULL DEFAULT 'other',
    version_number integer NOT NULL DEFAULT 1, storage_key text NOT NULL, content_type varchar(150) NOT NULL, size_bytes integer NOT NULL,
    expires_at date, reviewed_at timestamptz, download_restricted boolean NOT NULL DEFAULT true, contact_id uuid, company_id uuid, account_id uuid, kyc_case_id uuid,
    uploaded_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS document_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, document_id uuid NOT NULL REFERENCES brokerage_documents(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, action varchar(30) NOT NULL, ip_address varchar(100), created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS brokerage_account_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, account_id uuid NOT NULL REFERENCES brokerage_accounts(id) ON DELETE CASCADE,
    holdings jsonb NOT NULL DEFAULT '[]', available_cash numeric(20,2), recent_transactions jsonb NOT NULL DEFAULT '[]', orders jsonb NOT NULL DEFAULT '[]',
    account_value numeric(20,2), last_trade_at timestamptz, inactivity_days integer, source varchar(100) NOT NULL, synced_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS compliance_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, type varchar(50) NOT NULL, status varchar(30) NOT NULL DEFAULT 'open', priority varchar(20) NOT NULL DEFAULT 'medium',
    title varchar(255) NOT NULL, description text, contact_id uuid, company_id uuid, account_id uuid, assigned_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    due_at date, resolution text, resolved_at timestamptz, created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS communication_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, type varchar(50) NOT NULL, direction varchar(20) NOT NULL DEFAULT 'internal',
    subject varchar(255) NOT NULL, body text, contact_id uuid, company_id uuid, account_id uuid, lead_id uuid, occurred_at timestamptz NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}', created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now()
  )`,
];

export class AddBrokerageMvp1764801900000 implements MigrationInterface {
  name = "AddBrokerageMvp1764801900000";
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    for (const table of tables) await queryRunner.query(table);
    if (await queryRunner.hasTable("pipelines")) {
      const stages = [
        ["prospect", "Prospect", "default", 10, false, false],
        ["kyc-pending", "KYC Pending", "warning", 20, false, false],
        ["documents-review", "Documents Review", "info", 35, false, false],
        ["account-approved", "Account Approved", "brand", 55, false, false],
        ["funding-pending", "Funding Pending", "warning", 70, false, false],
        ["active-client", "Active Client", "success", 100, false, true],
        ["dormant", "Dormant", "default", 0, false, false],
        ["closed", "Closed", "error", 0, true, false],
      ].map(([id, name, color, probability, isClosed, isWon], position) => ({ id, name, color, position, probability, isClosed, isWon }));
      await queryRunner.query("UPDATE pipelines SET stages = $1::jsonb WHERE is_default = true", [JSON.stringify(stages)]);
    }
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_brokerage_accounts_tenant ON brokerage_accounts(tenant_id)");
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_kyc_cases_tenant_status ON kyc_cases(tenant_id, status)");
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_brokerage_documents_tenant ON brokerage_documents(tenant_id)");
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_compliance_cases_tenant_status ON compliance_cases(tenant_id, status)");
    await queryRunner.query("CREATE INDEX IF NOT EXISTS idx_communication_records_tenant_occurred ON communication_records(tenant_id, occurred_at)");
    for (const code of permissions) {
      await queryRunner.query("INSERT INTO permissions (code, name, description) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING", [code, code.split(".").map((part) => part.replace(/^./, (v) => v.toUpperCase())).join(" / "), "Brokerage CRM MVP permission"]);
    }
    const readOnly = permissions.filter((code) => code.endsWith(".read") || code === "brokerageAccounts.snapshot.read");
    const advisor = permissions.filter((code) => !["documents.download", "kyc.review", "compliance.create", "compliance.update"].includes(code));
    const manager = permissions.filter((code) => code !== "documents.download");
    const grants: Record<string, string[]> = { "CRM.Admin": permissions, Admin: permissions, "CRM.Manager": manager, Manager: manager, "CRM.Advisor": advisor, Advisor: advisor, "CRM.ReadOnly": readOnly, ReadOnly: readOnly, "CRM.Compliance": manager, Compliance: manager };
    for (const [role, grant] of Object.entries(grants)) for (const permission of grant) await queryRunner.query(`INSERT INTO role_permissions (permission_id, role_id) SELECT p.id, r.id FROM permissions p, roles r WHERE p.code = $1 AND lower(r.entra_app_role_value) = lower($2) ON CONFLICT DO NOTHING`, [permission, role]);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS communication_records, compliance_cases, brokerage_account_snapshots, document_access_logs, brokerage_documents, suitability_profiles, kyc_reviews, kyc_cases, brokerage_accounts");
  }
}
