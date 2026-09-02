import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { Repository } from "typeorm";

import { getObject, putObject, statObject } from "../../config/storage";
import { AppDataSource } from "../../database/data-source";
import { recordActivity } from "../activities/activity.service";
import { Company } from "../companies/company.entity";
import { Contact } from "../contacts/contact.entity";
import { Lead } from "../leads/lead.entity";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import {
  BrokerageAccount,
  BrokerageAccountSnapshot,
  BrokerageDocument,
  CommunicationRecord,
  ComplianceCase,
  DocumentAccessLog,
  KycCase,
  KycReview,
  SuitabilityProfile,
} from "./brokerage.entity";
import {
  createBrokerageAccountSchema,
  createCommunicationSchema,
  createComplianceCaseSchema,
  createDocumentSchema,
  createKycCaseSchema,
  createKycReviewSchema,
  createSuitabilitySchema,
  updateBrokerageAccountSchema,
  updateComplianceCaseSchema,
  updateKycCaseSchema,
  updateSuitabilitySchema,
} from "./brokerage.schema";
import { canAccessRecord, canViewField, getDataScope, hasResourceRestriction } from "../access/access-control";
import { getListQuery, matchesDateRange, matchesQuery, matchesSearch, paginate } from "../../shared/utils/list-query";

// This module accepts validated DTOs from several independent schemas. Keeping
// the repository helper structural avoids TypeORM's array overload inference
// while each payload is still validated before it reaches persistence.
const repo = <T extends object>(entity: { new (): T }): Repository<any> => AppDataSource.getRepository(entity as any);

async function context(req: Request) {
  const sessionUser = req.session.user;
  if (!sessionUser) return null;
  const user = await repo(User).findOne({
    where: {
      entraTenantId: sessionUser.tenantId,
      entraObjectId: sessionUser.entraObjectId,
      status: UserStatus.ACTIVE,
      isAccessEnabled: true,
    },
  });
  return user ? { sessionUser, user } : null;
}

function badRequest(res: Response, message: string, errors?: unknown) {
  res.status(400).json({ success: false, message, ...(errors ? { errors } : {}) });
}

function maskAccountNumber(value: string) {
  const clean = value.trim();
  return `••••••${clean.slice(-4)}`;
}

function userDto(user: User | null | undefined) {
  if (!user) return null;
  return {
    id: user.entraObjectId,
    name: user.displayName.replace(/\s*\(CGSI\)\s*$/i, "").trim(),
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ? `/api/v1/users/${user.entraObjectId}/avatar` : null,
  };
}

function accountDto(account: BrokerageAccount, req?: Request) {
  const canSeeExternalId = !req || canViewField(req, "brokerageAccounts.externalId");
  return {
    id: account.id,
    accountNumber: maskAccountNumber(account.accountNumber),
    accountType: account.accountType,
    status: account.status,
    openedAt: account.openedAt,
    approvedAt: account.approvedAt,
    fundingStatus: account.fundingStatus,
    externalAccountId: canSeeExternalId ? account.externalAccountId : null,
    contact: account.contact ? { id: account.contact.id, name: account.contact.name, avatarUrl: account.contact.avatarUrl ? `/api/v1/contacts/${account.contact.id}/avatar` : null } : null,
    company: account.company ? { id: account.company.id, name: account.company.name, logoUrl: account.company.logoUrl ? `/api/v1/companies/${account.company.id}/logo` : null } : null,
    assignedTo: userDto(account.assignedUser),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

function kycDto(item: KycCase, reviews: KycReview[] = [], req?: Request) {
  const canSee = !req || canViewField(req, "kyc.details");
  return {
    id: item.id,
    contactId: item.contactId,
    companyId: item.companyId,
    accountId: item.accountId,
    status: item.status,
    identityVerification: item.identityVerification,
    beneficialOwners: canSee ? item.beneficialOwners : [],
    authorizedRepresentatives: canSee ? item.authorizedRepresentatives : [],
    sourceOfFunds: canSee ? item.sourceOfFunds : null,
    purposeOfAccount: canSee ? item.purposeOfAccount : null,
    pepStatus: item.pepStatus,
    sanctionsStatus: item.sanctionsStatus,
    missingDocuments: item.missingDocuments,
    expiredDocuments: item.expiredDocuments,
    enhancedDueDiligence: item.enhancedDueDiligence,
    nextReviewAt: item.nextReviewAt,
    assignedReviewer: userDto(item.assignedReviewer),
    reviewHistory: canSee ? reviews.map((review) => ({ id: review.id, decision: review.decision, notes: review.notes, reviewerId: review.reviewerId, createdAt: review.createdAt.toISOString() })) : [],
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function suitabilityDto(item: SuitabilityProfile, req?: Request) {
  const canSee = !req || canViewField(req, "suitability.details");
  return { ...item, investmentObjective: canSee ? item.investmentObjective : null, incomeRange: canSee ? item.incomeRange : null, netWorthRange: canSee ? item.netWorthRange : null, liquidityNeeds: canSee ? item.liquidityNeeds : null, preferredSecurities: canSee ? item.preferredSecurities : [], approver: userDto(item.approver), reviewedAt: item.reviewedAt, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() };
}

function documentDto(item: BrokerageDocument) {
  return { id: item.id, fileName: item.fileName, category: item.category, versionNumber: item.versionNumber, contentType: item.contentType, sizeBytes: item.sizeBytes, expiresAt: item.expiresAt, reviewedAt: item.reviewedAt?.toISOString() ?? null, downloadRestricted: item.downloadRestricted, contactId: item.contactId, companyId: item.companyId, accountId: item.accountId, kycCaseId: item.kycCaseId, uploadedById: item.uploadedById, createdAt: item.createdAt.toISOString() };
}

function complianceDto(item: ComplianceCase) {
  return { ...item, assignedTo: userDto(item.assignedUser), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), resolvedAt: item.resolvedAt?.toISOString() ?? null };
}

function communicationDto(item: CommunicationRecord, req?: Request) {
  return { ...item, body: !req || canViewField(req, "communications.body") ? item.body : null, occurredAt: item.occurredAt.toISOString(), createdAt: item.createdAt.toISOString() };
}

async function relatedEntities(input: { contactId?: string | null; companyId?: string | null; accountId?: string | null; kycCaseId?: string | null; leadId?: string | null }, tenantId: string) {
  const contact = input.contactId ? await repo(Contact).findOneBy({ id: input.contactId, tenantId }) : null;
  const company = input.companyId ? await repo(Company).findOneBy({ id: input.companyId, tenantId }) : null;
  const account = input.accountId ? await repo(BrokerageAccount).findOneBy({ id: input.accountId, tenantId }) : null;
  const kycCase = input.kycCaseId ? await repo(KycCase).findOneBy({ id: input.kycCaseId, tenantId }) : null;
  const lead = input.leadId ? await repo(Lead).findOne({ where: { id: input.leadId, owner: { entraTenantId: tenantId } } }) : null;
  return { contact, company, account, kycCase, lead };
}

async function assignedUser(tenantId: string, entraObjectId?: string | null) {
  if (!entraObjectId) return null;
  return repo(User).findOne({ where: { entraTenantId: tenantId, entraObjectId, status: UserStatus.ACTIVE, isAccessEnabled: true } });
}

async function audit(req: Request, action: string, target: string, resource: string, entityId: string) {
  const c = await context(req);
  if (!c) return;
  await recordActivity({ tenantId: c.sessionUser.tenantId, actorId: c.user.id, actorObjectId: c.sessionUser.entraObjectId, actorName: c.user.displayName, actorAvatarUrl: c.user.avatarUrl ? `/api/v1/users/${c.user.entraObjectId}/avatar` : null, action, target, category: "Brokerage", resource, entityId, ipAddress: req.ip });
}

export async function listBrokerageAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const query = getListQuery(req, 25);
    const rows = await repo(BrokerageAccount).find({ where: { tenantId: c.sessionUser.tenantId }, relations: { contact: true, company: true, assignedUser: true }, order: { createdAt: "DESC" } });
    const scope = getDataScope(req, "brokerageAccounts");
    const visible = rows.filter((row) => canAccessRecord(req, "brokerageAccounts", row.id)).filter((row) => scope === "own" ? row.createdById === c.user.id : scope === "assigned" ? row.assignedUserId === c.user.id || row.createdById === c.user.id : true)
      .filter((row) => !query.status || row.status === query.status).filter((row) => !query.type || row.accountType === query.type).filter((row) => !query.fundingStatus || row.fundingStatus === query.fundingStatus)
      .filter((row) => !query.assignedTo || row.assignedUser?.entraObjectId === query.assignedTo || matchesQuery(row.assignedUser?.displayName, query.assignedTo))
      .filter((row) => matchesSearch([row.accountNumber, row.accountType, row.status, row.fundingStatus, row.contact?.name, row.company?.name, row.externalAccountId].join(" "), query.search));
    const page = paginate(visible, query);
    res.status(200).json({ data: page.data.map((row) => accountDto(row, req)), meta: page.meta });
  } catch (error) { next(error); }
}

export async function createBrokerageAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    if (hasResourceRestriction(req, "brokerageAccounts")) { res.status(403).json({ success: false, message: "Account access is restricted to assigned records." }); return; }
    const parsed = createBrokerageAccountSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the brokerage account fields.", parsed.error.issues); return; }
    const related = await relatedEntities(parsed.data, c.sessionUser.tenantId);
    if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company)) { badRequest(res, "The selected contact or company was not found."); return; }
    const assignee = await assignedUser(c.sessionUser.tenantId, parsed.data.assignedToId);
    if (parsed.data.assignedToId && !assignee) { badRequest(res, "The selected relationship manager was not found."); return; }
    const entity = repo(BrokerageAccount).create({ ...parsed.data, tenantId: c.sessionUser.tenantId, assignedUserId: assignee?.id ?? null, assignedUser: assignee, contact: related.contact, company: related.company, createdById: c.user.id } as any) as unknown as BrokerageAccount;
    const saved = await repo(BrokerageAccount).save(entity);
    const full = await repo(BrokerageAccount).findOneOrFail({ where: { id: saved.id }, relations: { contact: true, company: true, assignedUser: true } });
    await audit(req, "created brokerage account", maskAccountNumber(saved.accountNumber), "brokerageAccounts", saved.id);
    res.status(201).json({ data: accountDto(full, req) });
  } catch (error) { next(error); }
}

export async function updateBrokerageAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const row = await repo(BrokerageAccount).findOne({ where: { id: String(req.params.id), tenantId: c.sessionUser.tenantId }, relations: { contact: true, company: true, assignedUser: true } });
    if (!row || !canAccessRecord(req, "brokerageAccounts", row.id)) { res.status(404).json({ success: false, message: "Brokerage account not found." }); return; }
    const parsed = updateBrokerageAccountSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the brokerage account fields.", parsed.error.issues); return; }
    const related = await relatedEntities(parsed.data, c.sessionUser.tenantId);
    if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company)) { badRequest(res, "The selected contact or company was not found."); return; }
    const assignee = parsed.data.assignedToId !== undefined ? await assignedUser(c.sessionUser.tenantId, parsed.data.assignedToId) : row.assignedUser;
    if (parsed.data.assignedToId && !assignee) { badRequest(res, "The selected relationship manager was not found."); return; }
    Object.assign(row, parsed.data, parsed.data.assignedToId !== undefined ? { assignedUserId: assignee?.id ?? null, assignedUser: assignee } : {}, parsed.data.contactId !== undefined ? { contact: related.contact } : {}, parsed.data.companyId !== undefined ? { company: related.company } : {});
    const saved = await repo(BrokerageAccount).save(row);
    await audit(req, "updated brokerage account", maskAccountNumber(saved.accountNumber), "brokerageAccounts", saved.id);
    res.status(200).json({ data: accountDto(saved, req) });
  } catch (error) { next(error); }
}

export async function getAccountSnapshot(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const account = await repo(BrokerageAccount).findOneBy({ id: String(req.params.id), tenantId: c.sessionUser.tenantId });
    if (!account || !canAccessRecord(req, "brokerageAccounts", account.id)) { res.status(404).json({ success: false, message: "Account snapshot not found." }); return; }
    const snapshot = await repo(BrokerageAccountSnapshot).findOne({ where: { accountId: account.id, tenantId: c.sessionUser.tenantId }, order: { syncedAt: "DESC" } });
    const visible = !snapshot || canViewField(req, "brokerageAccounts.snapshot");
    res.status(200).json({ data: visible && snapshot ? { ...snapshot, syncedAt: snapshot.syncedAt.toISOString(), lastTradeAt: snapshot.lastTradeAt?.toISOString() ?? null } : null, readOnly: true });
  } catch (error) { next(error); }
}

export async function listKycCases(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const query = getListQuery(req, 25);
    const rows = await repo(KycCase).find({ where: { tenantId: c.sessionUser.tenantId }, relations: { assignedReviewer: true }, order: { updatedAt: "DESC" } });
    const filtered = rows.filter((row) => canAccessRecord(req, "kyc", row.id)).filter((row) => !query.status || row.status === query.status).filter((row) => matchesDateRange(row.nextReviewAt, query.dateFrom, query.dateTo)).filter((row) => matchesSearch([row.status, row.identityVerification, row.pepStatus, row.sanctionsStatus, row.sourceOfFunds, row.purposeOfAccount].join(" "), query.search));
    const page = paginate(filtered, query);
    const reviews = await repo(KycReview).find({ where: { tenantId: c.sessionUser.tenantId } });
    res.status(200).json({ data: page.data.map((row) => kycDto(row, reviews.filter((review) => review.caseId === row.id))), meta: page.meta });
  } catch (error) { next(error); }
}

export async function createKycCase(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    if (hasResourceRestriction(req, "kyc")) { res.status(403).json({ success: false, message: "KYC access is restricted to assigned records." }); return; }
    const parsed = createKycCaseSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the KYC case fields.", parsed.error.issues); return; }
    const related = await relatedEntities(parsed.data, c.sessionUser.tenantId); if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company) || (parsed.data.accountId && !related.account)) { badRequest(res, "The selected relationship was not found."); return; }
    const reviewer = await assignedUser(c.sessionUser.tenantId, parsed.data.assignedReviewerId); if (parsed.data.assignedReviewerId && !reviewer) { badRequest(res, "The selected reviewer was not found."); return; }
    const entity = repo(KycCase).create({ ...parsed.data, tenantId: c.sessionUser.tenantId, assignedReviewerId: reviewer?.id ?? null, assignedReviewer: reviewer, createdById: c.user.id } as any) as unknown as KycCase;
    const saved = await repo(KycCase).save(entity);
    await audit(req, "created KYC case", saved.id, "kyc", saved.id); res.status(201).json({ data: kycDto(saved) });
  } catch (error) { next(error); }
}

export async function updateKycCase(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const row = await repo(KycCase).findOne({ where: { id: String(req.params.id), tenantId: c.sessionUser.tenantId }, relations: { assignedReviewer: true } }); if (!row || !canAccessRecord(req, "kyc", row.id)) { res.status(404).json({ success: false, message: "KYC case not found." }); return; }
    const parsed = updateKycCaseSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the KYC case fields.", parsed.error.issues); return; }
    const reviewer = parsed.data.assignedReviewerId !== undefined ? await assignedUser(c.sessionUser.tenantId, parsed.data.assignedReviewerId) : row.assignedReviewer; if (parsed.data.assignedReviewerId && !reviewer) { badRequest(res, "The selected reviewer was not found."); return; }
    Object.assign(row, parsed.data, parsed.data.assignedReviewerId !== undefined ? { assignedReviewerId: reviewer?.id ?? null, assignedReviewer: reviewer } : {}); const saved = await repo(KycCase).save(row); await audit(req, "updated KYC case", saved.id, "kyc", saved.id); res.status(200).json({ data: kycDto(saved) });
  } catch (error) { next(error); }
}

export async function reviewKycCase(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const row = await repo(KycCase).findOneBy({ id: String(req.params.id), tenantId: c.sessionUser.tenantId }); if (!row || !canAccessRecord(req, "kyc", row.id)) { res.status(404).json({ success: false, message: "KYC case not found." }); return; }
    const parsed = createKycReviewSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please provide a valid KYC decision.", parsed.error.issues); return; }
    await AppDataSource.transaction(async (manager) => { row.status = (parsed.data.decision === "needs_information" ? "needs_information" : parsed.data.decision === "escalated" ? "in_review" : parsed.data.decision) as any; await manager.save(row); await manager.save(manager.create(KycReview, { tenantId: c.sessionUser.tenantId, caseId: row.id, reviewerId: c.user.id, decision: parsed.data.decision, notes: parsed.data.notes ?? null })); });
    await audit(req, `KYC review ${parsed.data.decision}`, row.id, "kyc", row.id); res.status(200).json({ data: { id: row.id, status: row.status } });
  } catch (error) { next(error); }
}

export async function listSuitabilityProfiles(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const query = getListQuery(req, 25); const rows = await repo(SuitabilityProfile).find({ where: { tenantId: c.sessionUser.tenantId }, relations: { approver: true }, order: { updatedAt: "DESC" } }); const filtered = rows.filter((row) => canAccessRecord(req, "suitability", row.id)).filter((row) => !query.status || row.status === query.status).filter((row) => matchesSearch([row.investmentObjective, row.riskProfile, row.status, row.preferredSecurities].join(" "), query.search)); const page = paginate(filtered, query); res.status(200).json({ data: page.data.map(suitabilityDto), meta: page.meta }); } catch (error) { next(error); } }

export async function createSuitabilityProfile(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const parsed = createSuitabilitySchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the suitability profile fields.", parsed.error.issues); return; } const related = await relatedEntities(parsed.data, c.sessionUser.tenantId); if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company) || (parsed.data.accountId && !related.account)) { badRequest(res, "The selected relationship was not found."); return; } const approver = await assignedUser(c.sessionUser.tenantId, parsed.data.approverId); if (parsed.data.approverId && !approver) { badRequest(res, "The selected approver was not found."); return; } const entity = repo(SuitabilityProfile).create({ ...parsed.data, tenantId: c.sessionUser.tenantId, approverId: approver?.id ?? null, approver, createdById: c.user.id } as any) as SuitabilityProfile; const saved = await repo(SuitabilityProfile).save(entity); await audit(req, "created suitability profile", saved.id, "suitability", saved.id); res.status(201).json({ data: suitabilityDto(saved) }); } catch (error) { next(error); } }

export async function updateSuitabilityProfile(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const row = await repo(SuitabilityProfile).findOne({ where: { id: String(req.params.id), tenantId: c.sessionUser.tenantId }, relations: { approver: true } }); if (!row || !canAccessRecord(req, "suitability", row.id)) { res.status(404).json({ success: false, message: "Suitability profile not found." }); return; } const parsed = updateSuitabilitySchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the suitability profile fields.", parsed.error.issues); return; } const approver = parsed.data.approverId !== undefined ? await assignedUser(c.sessionUser.tenantId, parsed.data.approverId) : row.approver; Object.assign(row, parsed.data, parsed.data.approverId !== undefined ? { approverId: approver?.id ?? null, approver } : {}); const saved = await repo(SuitabilityProfile).save(row); await audit(req, "updated suitability profile", saved.id, "suitability", saved.id); res.status(200).json({ data: suitabilityDto(saved) }); } catch (error) { next(error); } }

export async function listDocuments(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const query = getListQuery(req, 25); const rows = await repo(BrokerageDocument).find({ where: { tenantId: c.sessionUser.tenantId }, order: { createdAt: "DESC" } }); const filtered = rows.filter((row) => canAccessRecord(req, "documents", row.id)).filter((row) => !query.category || row.category === query.category).filter((row) => matchesDateRange(row.expiresAt, query.dateFrom, query.dateTo)).filter((row) => matchesSearch([row.fileName, row.category].join(" "), query.search)); const page = paginate(filtered, query); res.status(200).json({ data: page.data.map(documentDto), meta: page.meta }); } catch (error) { next(error); } }

export async function uploadDocument(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } if (!req.file) { badRequest(res, "Please select a document to upload."); return; } const body = { ...req.body, downloadRestricted: req.body.downloadRestricted ?? "true" }; const parsed = createDocumentSchema.safeParse(body); if (!parsed.success) { badRequest(res, "Please check the document fields.", parsed.error.issues); return; } const related = await relatedEntities(parsed.data, c.sessionUser.tenantId); if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company) || (parsed.data.accountId && !related.account) || (parsed.data.kycCaseId && !related.kycCase)) { badRequest(res, "The selected relationship was not found."); return; } const previous = parsed.data.accountId ? await repo(BrokerageDocument).find({ where: { tenantId: c.sessionUser.tenantId, fileName: parsed.data.fileName, accountId: parsed.data.accountId }, order: { versionNumber: "DESC" }, take: 1 }) : []; const objectKey = `brokerage-documents/${c.sessionUser.tenantId}/${randomUUID()}-${parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`; await putObject(objectKey, req.file.buffer, req.file.mimetype); const entity = repo(BrokerageDocument).create({ ...parsed.data, tenantId: c.sessionUser.tenantId, fileName: parsed.data.fileName, storageKey: objectKey, contentType: req.file.mimetype, sizeBytes: req.file.size, versionNumber: (previous[0]?.versionNumber ?? 0) + 1, uploadedById: c.user.id } as any) as BrokerageDocument; const saved = await repo(BrokerageDocument).save(entity); await audit(req, "uploaded brokerage document", saved.fileName, "documents", saved.id); res.status(201).json({ data: documentDto(saved) }); } catch (error) { next(error); } }

export async function downloadDocument(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const row = await repo(BrokerageDocument).findOneBy({ id: String(req.params.id), tenantId: c.sessionUser.tenantId }); if (!row || !canAccessRecord(req, "documents", row.id)) { res.status(404).json({ success: false, message: "Document not found." }); return; } if (row.downloadRestricted) { res.status(403).json({ success: false, message: "Downloads are restricted for this document." }); return; } const stream = await getObject(row.storageKey); const info = await statObject(row.storageKey).catch(() => undefined); await repo(DocumentAccessLog).save(repo(DocumentAccessLog).create({ tenantId: c.sessionUser.tenantId, documentId: row.id, userId: c.user.id, action: "download", ipAddress: req.ip })); res.setHeader("Content-Type", row.contentType ?? info?.metaData?.["content-type"] ?? "application/octet-stream"); res.setHeader("Content-Disposition", `attachment; filename="${row.fileName.replace(/[\"\r\n]/g, "_")}"`); stream.on("error", next); stream.pipe(res); } catch (error) { next(error); } }

export async function listComplianceCases(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const query = getListQuery(req, 25); const rows = await repo(ComplianceCase).find({ where: { tenantId: c.sessionUser.tenantId }, relations: { assignedUser: true }, order: { dueAt: "ASC", createdAt: "DESC" } }); const filtered = rows.filter((row) => canAccessRecord(req, "compliance", row.id)).filter((row) => !query.status || row.status === query.status).filter((row) => !query.type || row.type === query.type).filter((row) => !query.priority || row.priority === query.priority).filter((row) => matchesSearch([row.title, row.description, row.type, row.priority, row.status].join(" "), query.search)); const page = paginate(filtered, query); res.status(200).json({ data: page.data.map(complianceDto), meta: page.meta }); } catch (error) { next(error); } }

export async function createComplianceCase(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const parsed = createComplianceCaseSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the compliance case fields.", parsed.error.issues); return; } const related = await relatedEntities(parsed.data, c.sessionUser.tenantId); if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company) || (parsed.data.accountId && !related.account)) { badRequest(res, "The selected relationship was not found."); return; } const assignee = await assignedUser(c.sessionUser.tenantId, parsed.data.assignedToId); if (parsed.data.assignedToId && !assignee) { badRequest(res, "The selected assignee was not found."); return; } const entity = repo(ComplianceCase).create({ ...parsed.data, tenantId: c.sessionUser.tenantId, assignedUserId: assignee?.id ?? null, assignedUser: assignee, createdById: c.user.id } as any) as ComplianceCase; const saved = await repo(ComplianceCase).save(entity); await audit(req, "created compliance case", saved.title, "compliance", saved.id); res.status(201).json({ data: complianceDto(saved) }); } catch (error) { next(error); } }

export async function updateComplianceCase(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const row = await repo(ComplianceCase).findOne({ where: { id: String(req.params.id), tenantId: c.sessionUser.tenantId }, relations: { assignedUser: true } }); if (!row || !canAccessRecord(req, "compliance", row.id)) { res.status(404).json({ success: false, message: "Compliance case not found." }); return; } const parsed = updateComplianceCaseSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the compliance case fields.", parsed.error.issues); return; } const assignee = parsed.data.assignedToId !== undefined ? await assignedUser(c.sessionUser.tenantId, parsed.data.assignedToId) : row.assignedUser; Object.assign(row, parsed.data, parsed.data.assignedToId !== undefined ? { assignedUserId: assignee?.id ?? null, assignedUser: assignee } : {}, parsed.data.status && ["resolved", "closed"].includes(parsed.data.status) ? { resolvedAt: new Date() } : {}); const saved = await repo(ComplianceCase).save(row); await audit(req, "updated compliance case", saved.title, "compliance", saved.id); res.status(200).json({ data: complianceDto(saved) }); } catch (error) { next(error); } }

export async function listCommunications(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const query = getListQuery(req, 25); const rows = await repo(CommunicationRecord).find({ where: { tenantId: c.sessionUser.tenantId }, order: { occurredAt: "DESC" } }); const filtered = rows.filter((row) => canAccessRecord(req, "communications", row.id)).filter((row) => !query.type || row.type === query.type).filter((row) => matchesDateRange(row.occurredAt, query.dateFrom, query.dateTo)).filter((row) => matchesSearch([row.type, row.subject, row.body].join(" "), query.search)); const page = paginate(filtered, query); res.status(200).json({ data: page.data.map(communicationDto), meta: page.meta }); } catch (error) { next(error); } }

export async function createCommunication(req: Request, res: Response, next: NextFunction) { try { const c = await context(req); if (!c) { res.status(401).json({ success: false, message: "Authentication is required." }); return; } const parsed = createCommunicationSchema.safeParse(req.body); if (!parsed.success) { badRequest(res, "Please check the communication record fields.", parsed.error.issues); return; } const related = await relatedEntities(parsed.data, c.sessionUser.tenantId); if ((parsed.data.contactId && !related.contact) || (parsed.data.companyId && !related.company) || (parsed.data.accountId && !related.account) || (parsed.data.leadId && !related.lead)) { badRequest(res, "The selected relationship was not found."); return; } const entity = repo(CommunicationRecord).create({ ...parsed.data, tenantId: c.sessionUser.tenantId, occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(), createdById: c.user.id } as any) as CommunicationRecord; const saved = await repo(CommunicationRecord).save(entity); await audit(req, "recorded communication", saved.subject, "communications", saved.id); res.status(201).json({ data: communicationDto(saved) }); } catch (error) { next(error); } }
