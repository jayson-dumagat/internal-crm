import { z } from "zod";

const nullableId = z.union([z.string().uuid(), z.literal("")]).transform((value) => value || null).nullable().optional();
const date = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."), z.literal("")]).transform((value) => value || null).nullable().optional();

export const brokerageAccountSchema = z.object({
  id: z.string(), accountNumber: z.string(), accountType: z.enum(["cash", "margin"]),
  status: z.enum(["pending", "active", "suspended", "dormant", "closed"]),
  openedAt: z.string().nullable(), approvedAt: z.string().nullable(), fundingStatus: z.string(), externalAccountId: z.string().nullable(),
  contact: z.object({ id: z.string(), name: z.string(), avatarUrl: z.string().nullable() }).nullable(),
  company: z.object({ id: z.string(), name: z.string(), logoUrl: z.string().nullable() }).nullable(),
  assignedTo: z.object({ id: z.string(), name: z.string(), email: z.string(), avatarUrl: z.string().nullable() }).nullable(),
  createdAt: z.string(), updatedAt: z.string(),
});
export type BrokerageAccountRecord = z.infer<typeof brokerageAccountSchema>;

export const kycCaseSchema = z.object({
  id: z.string(), contactId: z.string().nullable(), companyId: z.string().nullable(), accountId: z.string().nullable(), status: z.string(), identityVerification: z.string(), beneficialOwners: z.array(z.unknown()), authorizedRepresentatives: z.array(z.unknown()), sourceOfFunds: z.string().nullable(), purposeOfAccount: z.string().nullable(), pepStatus: z.string(), sanctionsStatus: z.string(), missingDocuments: z.array(z.string()), expiredDocuments: z.array(z.string()), enhancedDueDiligence: z.boolean(), nextReviewAt: z.string().nullable(), assignedReviewer: z.object({ id: z.string(), name: z.string(), email: z.string(), avatarUrl: z.string().nullable() }).nullable(), reviewHistory: z.array(z.object({ id: z.string(), decision: z.string(), notes: z.string().nullable(), reviewerId: z.string(), createdAt: z.string() })), createdAt: z.string(), updatedAt: z.string(),
});
export type KycCaseRecord = z.infer<typeof kycCaseSchema>;

export const suitabilityProfileSchema = z.object({ id: z.string(), contactId: z.string().nullable(), companyId: z.string().nullable(), accountId: z.string().nullable(), investmentObjective: z.string().nullable(), investmentHorizon: z.string().nullable(), tradingExperience: z.string().nullable(), productKnowledge: z.string().nullable(), incomeRange: z.string().nullable(), netWorthRange: z.string().nullable(), liquidityNeeds: z.string().nullable(), preferredSecurities: z.array(z.string()), riskProfile: z.string().nullable(), reviewedAt: z.string().nullable(), status: z.string(), approver: z.unknown().nullable(), createdAt: z.string(), updatedAt: z.string() });
export type SuitabilityProfileRecord = z.infer<typeof suitabilityProfileSchema>;

export const documentSchema = z.object({ id: z.string(), fileName: z.string(), category: z.string(), versionNumber: z.number(), contentType: z.string(), sizeBytes: z.number(), expiresAt: z.string().nullable(), reviewedAt: z.string().nullable(), downloadRestricted: z.boolean(), contactId: z.string().nullable(), companyId: z.string().nullable(), accountId: z.string().nullable(), kycCaseId: z.string().nullable(), uploadedById: z.string(), createdAt: z.string() });
export type BrokerageDocumentRecord = z.infer<typeof documentSchema>;

export const complianceCaseSchema = z.object({ id: z.string(), type: z.string(), status: z.string(), priority: z.string(), title: z.string(), description: z.string().nullable(), contactId: z.string().nullable(), companyId: z.string().nullable(), accountId: z.string().nullable(), assignedTo: z.unknown().nullable(), dueAt: z.string().nullable(), resolution: z.string().nullable(), resolvedAt: z.string().nullable(), createdById: z.string(), createdAt: z.string(), updatedAt: z.string() });
export type ComplianceCaseRecord = z.infer<typeof complianceCaseSchema>;

export const communicationRecordSchema = z.object({ id: z.string(), type: z.string(), direction: z.string(), subject: z.string(), body: z.string().nullable(), contactId: z.string().nullable(), companyId: z.string().nullable(), accountId: z.string().nullable(), leadId: z.string().nullable(), occurredAt: z.string(), metadata: z.record(z.string(), z.unknown()), createdById: z.string(), createdAt: z.string() });
export type CommunicationRecord = z.infer<typeof communicationRecordSchema>;

export const createAccountInputSchema = z.object({ accountNumber: z.string().trim().min(4).max(120), accountType: z.enum(["cash", "margin"]), status: z.enum(["pending", "active", "suspended", "dormant", "closed"]), openedAt: date, approvedAt: date, assignedToId: nullableId, fundingStatus: z.enum(["not_funded", "partially_funded", "funded", "withdrawal_hold"]), externalAccountId: z.string().trim().max(255).nullable().optional(), contactId: nullableId, companyId: nullableId });
export type CreateAccountInput = z.infer<typeof createAccountInputSchema>;

export const createComplianceInputSchema = z.object({ type: z.enum(["kyc_renewal", "suspicious_activity", "unusual_transaction", "watchlist", "suitability_exception", "dormant_account", "complaint", "supervisor_approval", "manual_override"]), status: z.enum(["open", "in_review", "escalated", "resolved", "closed"]), priority: z.enum(["low", "medium", "high", "critical"]), title: z.string().trim().min(1).max(255), description: z.string().max(10000).nullable().optional(), contactId: nullableId, companyId: nullableId, accountId: nullableId, assignedToId: nullableId, dueAt: date, resolution: z.string().max(10000).nullable().optional() });
export type CreateComplianceInput = z.infer<typeof createComplianceInputSchema>;
