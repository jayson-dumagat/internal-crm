import { z } from "zod";

const id = z.union([z.string().uuid(), z.literal("")]).transform((value) => value || null).nullable().optional();
const date = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."), z.literal("")]).transform((value) => value || null).nullable().optional();
const text = (max: number) => z.string().trim().max(max).nullable().optional();

export const createBrokerageAccountSchema = z.object({
  accountNumber: z.string().trim().min(4).max(120),
  accountType: z.enum(["cash", "margin"]).default("cash"),
  status: z.enum(["pending", "active", "suspended", "dormant", "closed"]).default("pending"),
  openedAt: date,
  approvedAt: date,
  assignedToId: z.string().uuid().nullable().optional(),
  fundingStatus: z.enum(["not_funded", "partially_funded", "funded", "withdrawal_hold"]).default("not_funded"),
  externalAccountId: text(255),
  contactId: id,
  companyId: id,
});

export const updateBrokerageAccountSchema = createBrokerageAccountSchema.partial();

const partyFields = {
  contactId: id,
  companyId: id,
  accountId: id,
};

export const createKycCaseSchema = z.object({
  ...partyFields,
  status: z.enum(["pending", "in_review", "needs_information", "approved", "rejected", "expired"]).default("pending"),
  identityVerification: z.string().trim().max(30).default("pending"),
  beneficialOwners: z.array(z.record(z.string(), z.unknown())).max(100).default([]),
  authorizedRepresentatives: z.array(z.record(z.string(), z.unknown())).max(100).default([]),
  sourceOfFunds: z.string().trim().max(500).nullable().optional(),
  purposeOfAccount: z.string().trim().max(500).nullable().optional(),
  pepStatus: z.enum(["not_started", "clear", "potential_match", "confirmed_match", "review_required"]).default("not_started"),
  sanctionsStatus: z.enum(["not_started", "clear", "potential_match", "confirmed_match", "review_required"]).default("not_started"),
  missingDocuments: z.array(z.string().trim().max(255)).max(100).default([]),
  expiredDocuments: z.array(z.string().trim().max(255)).max(100).default([]),
  enhancedDueDiligence: z.boolean().default(false),
  nextReviewAt: date,
  assignedReviewerId: z.string().uuid().nullable().optional(),
});
export const updateKycCaseSchema = createKycCaseSchema.partial();
export const createKycReviewSchema = z.object({
  decision: z.enum(["approved", "rejected", "needs_information", "escalated"]),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const createSuitabilitySchema = z.object({
  ...partyFields,
  investmentObjective: text(255),
  investmentHorizon: text(100),
  tradingExperience: text(100),
  productKnowledge: text(100),
  incomeRange: text(100),
  netWorthRange: text(100),
  liquidityNeeds: text(255),
  preferredSecurities: z.array(z.string().trim().max(80)).max(100).default([]),
  riskProfile: z.enum(["conservative", "balanced", "aggressive"]).nullable().optional(),
  reviewedAt: date,
  approverId: z.string().uuid().nullable().optional(),
  status: z.enum(["pending", "approved", "rejected", "expired"]).default("pending"),
});
export const updateSuitabilitySchema = createSuitabilitySchema.partial();

export const createDocumentSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  category: z.enum(["id", "account_opening", "corporate_registration", "tax_form", "risk_disclosure", "signed_agreement", "proof_of_address", "beneficial_ownership", "other"]).default("other"),
  expiresAt: date,
  downloadRestricted: z.preprocess((value) => value === "false" || value === false ? false : true, z.boolean()).default(true),
  ...partyFields,
  kycCaseId: id,
});

export const createComplianceCaseSchema = z.object({
  type: z.enum(["kyc_renewal", "suspicious_activity", "unusual_transaction", "watchlist", "suitability_exception", "dormant_account", "complaint", "supervisor_approval", "manual_override"]),
  status: z.enum(["open", "in_review", "escalated", "resolved", "closed"]).default("open"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  title: z.string().trim().min(1).max(255),
  description: text(10000),
  ...partyFields,
  assignedToId: z.string().uuid().nullable().optional(),
  dueAt: date,
  resolution: text(10000),
});
export const updateComplianceCaseSchema = createComplianceCaseSchema.partial();

export const createCommunicationSchema = z.object({
  type: z.enum(["call", "email", "trade_instruction", "research_recommendation", "disclosure_sent", "consent", "complaint", "other"]),
  direction: z.enum(["inbound", "outbound", "internal"]).default("internal"),
  subject: z.string().trim().min(1).max(255),
  body: text(20000),
  ...partyFields,
  leadId: id,
  occurredAt: z.string().datetime({ offset: true }).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
