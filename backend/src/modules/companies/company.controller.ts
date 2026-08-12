import { randomUUID } from "node:crypto";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { getObject, putObject, removeObject, statObject } from "../../config/storage";
import { Contact } from "../contacts/contact.entity";
import { Company } from "./company.entity";
import { createCompanySchema, updateCompanySchema } from "./company.schema";
import { canAccessRecord, canViewField, firstHiddenInput, getDataScope, hasResourceRestriction } from "../access/access-control";

const companyRepository = () => AppDataSource.getRepository(Company);
const contactRepository = () => AppDataSource.getRepository(Contact);

export async function listCompanies(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const [companies, contacts] = await Promise.all([
      companyRepository().find({ where: { tenantId }, order: { createdAt: "DESC" } }),
      contactRepository().find({ where: { tenantId }, order: { createdAt: "ASC" } }),
    ]);

    const visibleCompanies = companies.filter((company) => canAccessRecord(req, "companies", company.id)).filter((company) => getDataScope(req, "companies") === "own"
      ? company.createdById === req.session.user?.entraObjectId
      : true);
    const visibleCompanyIds = new Set(visibleCompanies.map((company) => company.id));
    const contactsByCompany = new Map<string, Array<{ name: string; avatar: string | null }>>();

    for (const contact of contacts) {
      if (!contact.companyId || !visibleCompanyIds.has(contact.companyId)) continue;
      const companyContacts = contactsByCompany.get(contact.companyId) ?? [];
      companyContacts.push({
        name: contact.name,
        avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      });
      contactsByCompany.set(contact.companyId, companyContacts);
    }

    res.status(200).json({
      data: visibleCompanies.map((company) => toCompanyDto(company, contactsByCompany.get(company.id) ?? [], req)),
    });
  } catch (error) {
    next(error);
  }
}

export async function createCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    if (hasResourceRestriction(req, "companies")) {
      res.status(403).json({ success: false, message: "You cannot create companies while company access is restricted to assigned records." });
      return;
    }
    const forbiddenField = firstHiddenInput(req, req.body, {
      name: "companies.name", industry: "companies.industry", location: "companies.location",
      employees: "companies.employees", revenue: "companies.revenue", website: "companies.website",
      customerSince: "companies.customerSince", tags: "companies.tags", status: "companies.status",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
    const parsed = createCompanySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Please check the company fields and try again.",
        errors: parsed.error.issues,
      });
      return;
    }

    const company = companyRepository().create({
      ...parsed.data,
      tenantId,
      createdById: req.session.user?.entraObjectId ?? null,
    });
    const savedCompany = await companyRepository().save(company);

    res.status(201).json({ data: toCompanyDto(savedCompany, [], req) });
  } catch (error) {
    next(error);
  }
}

export async function updateCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!canAccessRecord(req, "companies", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }
    const forbiddenField = firstHiddenInput(req, req.body, {
      name: "companies.name", industry: "companies.industry", location: "companies.location",
      employees: "companies.employees", revenue: "companies.revenue", website: "companies.website",
      customerSince: "companies.customerSince", tags: "companies.tags", status: "companies.status",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
    const companyId = String(req.params.id);
    const company = await companyRepository().findOneBy({ id: companyId, tenantId: req.session.user?.tenantId ?? "" });
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }

    const parsed = updateCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the company fields and try again.", errors: parsed.error.issues });
      return;
    }

    Object.assign(company, parsed.data);
    const savedCompany = await companyRepository().save(company);
    const contacts = await contactRepository().find({ where: { companyId: savedCompany.id, tenantId: req.session.user?.tenantId ?? "" } });

    res.status(200).json({
      data: toCompanyDto(savedCompany, contacts.map((contact) => ({
        name: contact.name,
        avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      })), req),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!canAccessRecord(req, "companies", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }
    const companyId = String(req.params.id);
    const company = await companyRepository().findOneBy({ id: companyId, tenantId: req.session.user?.tenantId ?? "" });
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }

    const result = await companyRepository().delete(companyId);
    if (!result.affected) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }

    await contactRepository().update({ companyId }, { companyId: null });
    if (company.logoUrl) {
      await removeObject(company.logoUrl).catch((error) => {
        console.error("Failed to remove company logo from object storage", error);
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function uploadCompanyLogo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!canAccessRecord(req, "companies", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Company logo not found." });
      return;
    }
    const company = await companyRepository().findOneBy({ id: String(req.params.id), tenantId: req.session.user?.tenantId ?? "" });
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "Please select an image to upload." });
      return;
    }

    const contentType = resolveImageContentType(req.file);
    const objectKey = `companies/${company.id}/${randomUUID()}${mimeExtension(contentType)}`;
    await putObject(objectKey, req.file.buffer, contentType);

    const previousObjectKey = company.logoUrl;
    company.logoUrl = objectKey;
    company.logoContentType = contentType;
    const savedCompany = await companyRepository().save(company);

    if (previousObjectKey) {
      await removeObject(previousObjectKey).catch((error) => {
        console.error("Failed to remove previous company logo from object storage", error);
      });
    }

    const contacts = await contactRepository().find({ where: { companyId: savedCompany.id, tenantId: req.session.user?.tenantId ?? "" } });
    res.status(200).json({
      data: toCompanyDto(savedCompany, contacts.map((contact) => ({
        name: contact.name,
        avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      })), req),
    });
  } catch (error) {
    next(error);
  }
}

export async function getCompanyLogo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!canAccessRecord(req, "companies", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Company logo not found." });
      return;
    }
    if (!canViewField(req, "companies.name")) {
      res.status(404).json({ success: false, message: "Company logo not found." });
      return;
    }
    const company = await companyRepository().findOneBy({ id: String(req.params.id), tenantId: req.session.user?.tenantId ?? "" });
    if (!company?.logoUrl) {
      res.status(404).json({ success: false, message: "Company logo not found." });
      return;
    }

    const objectStream = await getObject(company.logoUrl);
    const metadata = await statObject(company.logoUrl).catch(() => undefined);
    const contentType = company.logoContentType
      ?? metadata?.metaData?.["content-type"]
      ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    objectStream.on("error", (error) => {
      if (res.headersSent) {
        res.destroy(error);
      } else {
        next(error);
      }
    });
    objectStream.pipe(res);
  } catch (error) {
    next(error);
  }
}

function toCompanyDto(
  company: Company,
  contacts: Array<{ name: string; avatar: string | null }>,
  req?: Request,
) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: company.id,
    name: canSee("companies.name") ? company.name : "Restricted",
    industry: company.industry ?? "—",
    location: company.location ?? "—",
    employees: company.employees ?? "—",
    revenue: company.revenue ?? "—",
    contacts: canSee("companies.contacts") ? contacts : [],
    website: company.website ?? "—",
    customerSince: company.customerSince ?? "—",
    tags: canSee("companies.tags") ? company.tags ?? [] : [],
    status: company.status,
    lastActivity: company.updatedAt
      ? company.updatedAt.toISOString().slice(0, 10)
      : "—",
    logoUrl: canSee("companies.name") && company.logoUrl ? `/api/v1/companies/${company.id}/logo` : null,
  };

  if (!canSee("companies.revenue")) dto.revenue = "Restricted";
  if (!canSee("companies.industry")) dto.industry = "Restricted";
  if (!canSee("companies.location")) dto.location = "Restricted";
  if (!canSee("companies.employees")) dto.employees = "Restricted";
  if (!canSee("companies.website")) dto.website = "Restricted";
  if (!canSee("companies.customerSince")) dto.customerSince = "Restricted";
  if (!canSee("companies.status")) dto.status = "Restricted";

  return {
    ...dto,
    customerSince: canSee("companies.customerSince") ? company.customerSince : null,
    lastActivity: company.updatedAt?.toISOString() ?? null,
  };
}

function mimeExtension(mimeType: string): string {
  const extension = mimeType.split("/")[1]?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension ? `.${extension}` : ".bin";
}

function resolveImageContentType(file: Express.Multer.File): string {
  if (file.mimetype.startsWith("image/")) {
    return file.mimetype;
  }

  switch (path.extname(file.originalname).toLowerCase()) {
    case ".gif": return "image/gif";
    case ".jpeg":
    case ".jpg": return "image/jpeg";
    case ".png": return "image/png";
    case ".svg": return "image/svg+xml";
    case ".webp": return "image/webp";
    default: return "application/octet-stream";
  }
}
