import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Company } from "../companies/company.entity";
import { Contact } from "../contacts/contact.entity";
import { Lead } from "../leads/lead.entity";
import { User } from "../users/user.entity";
import {
  BrokerageAccountStatus,
  BrokerageAccountType,
  CommunicationDirection,
  CommunicationType,
  ComplianceCaseType,
  ComplianceStatus,
  DocumentCategory,
  FundingStatus,
  KycStatus,
  ScreeningStatus,
  SuitabilityStatus,
} from "./brokerage.types";

@Entity({ name: "brokerage_accounts" })
@Index("idx_brokerage_accounts_tenant", ["tenantId"])
@Index("idx_brokerage_accounts_contact", ["contactId"])
@Index("idx_brokerage_accounts_company", ["companyId"])
@Index("idx_brokerage_accounts_status", ["status"])
export class BrokerageAccount {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "account_number", type: "text" }) accountNumber!: string;
  @Column({ name: "account_type", type: "varchar", length: 20, default: BrokerageAccountType.CASH }) accountType!: BrokerageAccountType;
  @Column({ type: "varchar", length: 30, default: BrokerageAccountStatus.PENDING }) status!: BrokerageAccountStatus;
  @Column({ name: "opened_at", type: "date", nullable: true }) openedAt!: string | null;
  @Column({ name: "approved_at", type: "date", nullable: true }) approvedAt!: string | null;
  @Column({ name: "assigned_user_id", type: "uuid", nullable: true }) assignedUserId!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" }) @JoinColumn({ name: "assigned_user_id" }) assignedUser!: User | null;
  @Column({ name: "funding_status", type: "varchar", length: 30, default: FundingStatus.NOT_FUNDED }) fundingStatus!: FundingStatus;
  @Column({ name: "external_account_id", type: "varchar", length: 255, nullable: true }) externalAccountId!: string | null;
  @Column({ name: "contact_id", type: "uuid", nullable: true }) contactId!: string | null;
  @ManyToOne(() => Contact, { nullable: true, onDelete: "SET NULL" }) @JoinColumn({ name: "contact_id" }) contact!: Contact | null;
  @Column({ name: "company_id", type: "uuid", nullable: true }) companyId!: string | null;
  @ManyToOne(() => Company, { nullable: true, onDelete: "SET NULL" }) @JoinColumn({ name: "company_id" }) company!: Company | null;
  @Column({ name: "created_by_id", type: "uuid" }) createdById!: string;
  @ManyToOne(() => User, { nullable: false, onDelete: "RESTRICT" }) @JoinColumn({ name: "created_by_id" }) createdBy!: User;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity({ name: "kyc_cases" })
@Index("idx_kyc_cases_tenant_status", ["tenantId", "status"])
export class KycCase {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "contact_id", type: "uuid", nullable: true }) contactId!: string | null;
  @Column({ name: "company_id", type: "uuid", nullable: true }) companyId!: string | null;
  @Column({ name: "account_id", type: "uuid", nullable: true }) accountId!: string | null;
  @Column({ type: "varchar", length: 30, default: KycStatus.PENDING }) status!: KycStatus;
  @Column({ name: "identity_verification", type: "varchar", length: 30, default: "pending" }) identityVerification!: string;
  @Column({ name: "beneficial_owners", type: "jsonb", default: "[]" }) beneficialOwners!: unknown[];
  @Column({ name: "authorized_representatives", type: "jsonb", default: "[]" }) authorizedRepresentatives!: unknown[];
  @Column({ name: "source_of_funds", type: "varchar", length: 500, nullable: true }) sourceOfFunds!: string | null;
  @Column({ name: "purpose_of_account", type: "varchar", length: 500, nullable: true }) purposeOfAccount!: string | null;
  @Column({ name: "pep_status", type: "varchar", length: 30, default: ScreeningStatus.NOT_STARTED }) pepStatus!: ScreeningStatus;
  @Column({ name: "sanctions_status", type: "varchar", length: 30, default: ScreeningStatus.NOT_STARTED }) sanctionsStatus!: ScreeningStatus;
  @Column({ name: "missing_documents", type: "text", array: true, default: "{}" }) missingDocuments!: string[];
  @Column({ name: "expired_documents", type: "text", array: true, default: "{}" }) expiredDocuments!: string[];
  @Column({ name: "enhanced_due_diligence", type: "boolean", default: false }) enhancedDueDiligence!: boolean;
  @Column({ name: "next_review_at", type: "date", nullable: true }) nextReviewAt!: string | null;
  @Column({ name: "assigned_reviewer_id", type: "uuid", nullable: true }) assignedReviewerId!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" }) @JoinColumn({ name: "assigned_reviewer_id" }) assignedReviewer!: User | null;
  @Column({ name: "created_by_id", type: "uuid" }) createdById!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity({ name: "kyc_reviews" })
@Index("idx_kyc_reviews_case", ["caseId"])
export class KycReview {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "case_id", type: "uuid" }) caseId!: string;
  @Column({ name: "reviewer_id", type: "uuid" }) reviewerId!: string;
  @Column({ type: "varchar", length: 30 }) decision!: string;
  @Column({ type: "text", nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity({ name: "suitability_profiles" })
@Index("idx_suitability_profiles_tenant", ["tenantId"])
export class SuitabilityProfile {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "contact_id", type: "uuid", nullable: true }) contactId!: string | null;
  @Column({ name: "company_id", type: "uuid", nullable: true }) companyId!: string | null;
  @Column({ name: "account_id", type: "uuid", nullable: true }) accountId!: string | null;
  @Column({ name: "investment_objective", type: "varchar", length: 255, nullable: true }) investmentObjective!: string | null;
  @Column({ name: "investment_horizon", type: "varchar", length: 100, nullable: true }) investmentHorizon!: string | null;
  @Column({ name: "trading_experience", type: "varchar", length: 100, nullable: true }) tradingExperience!: string | null;
  @Column({ name: "product_knowledge", type: "varchar", length: 100, nullable: true }) productKnowledge!: string | null;
  @Column({ name: "income_range", type: "varchar", length: 100, nullable: true }) incomeRange!: string | null;
  @Column({ name: "net_worth_range", type: "varchar", length: 100, nullable: true }) netWorthRange!: string | null;
  @Column({ name: "liquidity_needs", type: "varchar", length: 255, nullable: true }) liquidityNeeds!: string | null;
  @Column({ name: "preferred_securities", type: "text", array: true, default: "{}" }) preferredSecurities!: string[];
  @Column({ name: "risk_profile", type: "varchar", length: 30, nullable: true }) riskProfile!: string | null;
  @Column({ name: "reviewed_at", type: "date", nullable: true }) reviewedAt!: string | null;
  @Column({ name: "approver_id", type: "uuid", nullable: true }) approverId!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" }) @JoinColumn({ name: "approver_id" }) approver!: User | null;
  @Column({ type: "varchar", length: 30, default: SuitabilityStatus.PENDING }) status!: SuitabilityStatus;
  @Column({ name: "created_by_id", type: "uuid" }) createdById!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity({ name: "brokerage_documents" })
@Index("idx_brokerage_documents_tenant", ["tenantId"])
@Index("idx_brokerage_documents_expiry", ["expiresAt"])
export class BrokerageDocument {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "file_name", type: "varchar", length: 255 }) fileName!: string;
  @Column({ type: "varchar", length: 40, default: DocumentCategory.OTHER }) category!: DocumentCategory;
  @Column({ name: "version_number", type: "integer", default: 1 }) versionNumber!: number;
  @Column({ name: "storage_key", type: "text" }) storageKey!: string;
  @Column({ name: "content_type", type: "varchar", length: 150 }) contentType!: string;
  @Column({ name: "size_bytes", type: "integer" }) sizeBytes!: number;
  @Column({ name: "expires_at", type: "date", nullable: true }) expiresAt!: string | null;
  @Column({ name: "reviewed_at", type: "timestamptz", nullable: true }) reviewedAt!: Date | null;
  @Column({ name: "download_restricted", type: "boolean", default: true }) downloadRestricted!: boolean;
  @Column({ name: "contact_id", type: "uuid", nullable: true }) contactId!: string | null;
  @Column({ name: "company_id", type: "uuid", nullable: true }) companyId!: string | null;
  @Column({ name: "account_id", type: "uuid", nullable: true }) accountId!: string | null;
  @Column({ name: "kyc_case_id", type: "uuid", nullable: true }) kycCaseId!: string | null;
  @Column({ name: "uploaded_by_id", type: "uuid" }) uploadedById!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity({ name: "document_access_logs" })
@Index("idx_document_access_logs_document", ["documentId"])
export class DocumentAccessLog {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "document_id", type: "uuid" }) documentId!: string;
  @Column({ name: "user_id", type: "uuid" }) userId!: string;
  @Column({ type: "varchar", length: 30 }) action!: string;
  @Column({ name: "ip_address", type: "varchar", length: 100, nullable: true }) ipAddress!: string | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity({ name: "brokerage_account_snapshots" })
@Index("idx_account_snapshots_account", ["accountId"])
export class BrokerageAccountSnapshot {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ name: "account_id", type: "uuid" }) accountId!: string;
  @Column({ type: "jsonb", default: "[]" }) holdings!: unknown[];
  @Column({ name: "available_cash", type: "numeric", precision: 20, scale: 2, nullable: true }) availableCash!: string | null;
  @Column({ name: "recent_transactions", type: "jsonb", default: "[]" }) recentTransactions!: unknown[];
  @Column({ type: "jsonb", default: "[]" }) orders!: unknown[];
  @Column({ name: "account_value", type: "numeric", precision: 20, scale: 2, nullable: true }) accountValue!: string | null;
  @Column({ name: "last_trade_at", type: "timestamptz", nullable: true }) lastTradeAt!: Date | null;
  @Column({ name: "inactivity_days", type: "integer", nullable: true }) inactivityDays!: number | null;
  @Column({ type: "varchar", length: 100 }) source!: string;
  @Column({ name: "synced_at", type: "timestamptz" }) syncedAt!: Date;
}

@Entity({ name: "compliance_cases" })
@Index("idx_compliance_cases_tenant_status", ["tenantId", "status"])
export class ComplianceCase {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ type: "varchar", length: 50 }) type!: ComplianceCaseType;
  @Column({ type: "varchar", length: 30, default: ComplianceStatus.OPEN }) status!: ComplianceStatus;
  @Column({ type: "varchar", length: 20, default: "medium" }) priority!: string;
  @Column({ type: "varchar", length: 255 }) title!: string;
  @Column({ type: "text", nullable: true }) description!: string | null;
  @Column({ name: "contact_id", type: "uuid", nullable: true }) contactId!: string | null;
  @Column({ name: "company_id", type: "uuid", nullable: true }) companyId!: string | null;
  @Column({ name: "account_id", type: "uuid", nullable: true }) accountId!: string | null;
  @Column({ name: "assigned_user_id", type: "uuid", nullable: true }) assignedUserId!: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" }) @JoinColumn({ name: "assigned_user_id" }) assignedUser!: User | null;
  @Column({ name: "due_at", type: "date", nullable: true }) dueAt!: string | null;
  @Column({ type: "text", nullable: true }) resolution!: string | null;
  @Column({ name: "resolved_at", type: "timestamptz", nullable: true }) resolvedAt!: Date | null;
  @Column({ name: "created_by_id", type: "uuid" }) createdById!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity({ name: "communication_records" })
@Index("idx_communication_records_tenant_occurred", ["tenantId", "occurredAt"])
export class CommunicationRecord {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ type: "varchar", length: 50 }) type!: CommunicationType;
  @Column({ type: "varchar", length: 20, default: CommunicationDirection.INTERNAL }) direction!: CommunicationDirection;
  @Column({ type: "varchar", length: 255 }) subject!: string;
  @Column({ type: "text", nullable: true }) body!: string | null;
  @Column({ name: "contact_id", type: "uuid", nullable: true }) contactId!: string | null;
  @Column({ name: "company_id", type: "uuid", nullable: true }) companyId!: string | null;
  @Column({ name: "account_id", type: "uuid", nullable: true }) accountId!: string | null;
  @Column({ name: "lead_id", type: "uuid", nullable: true }) leadId!: string | null;
  @Column({ name: "occurred_at", type: "timestamptz" }) occurredAt!: Date;
  @Column({ type: "jsonb", default: "{}" }) metadata!: Record<string, unknown>;
  @Column({ name: "created_by_id", type: "uuid" }) createdById!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}
