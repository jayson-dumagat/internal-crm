import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { getObject, putObject, removeObject, statObject } from "../../config/storage";
import {
  mimeExtension as sharedMimeExtension,
  resolveImageContentType as sharedResolveImageContentType,
} from "../../shared/utils/media";
import { Contact } from "../contacts/contact.entity";
import { Company } from "./company.entity";
import { createCompanySchema, updateCompanySchema } from "./company.schema";
import { canAccessRecord, canViewField, firstHiddenInput, getDataScope, hasResourceRestriction } from "../access/access-control";
import { toCompanyContactSummary, toCompanyDto } from "./company.mapper";
import { getListQuery, matchesSearch, matchesStatus, paginate } from "../../shared/utils/list-query";
import { publishCrmEvent } from "../../services/realtime-events";

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
    const query = getListQuery(req, 25);
    const [companies, contacts] = await Promise.all([
      companyRepository().find({ where: { tenantId }, order: { createdAt: "DESC" } }),
      contactRepository().find({ where: { tenantId }, order: { createdAt: "ASC" } }),
    ]);

    const visibleCompanies = companies.filter((company) => canAccessRecord(req, "companies", company.id)).filter((company) => getDataScope(req, "companies") === "own"
      ? company.createdById === req.session.user?.entraObjectId
      : true);
    const filteredCompanies = visibleCompanies.filter((company) => matchesStatus(company.status, query.status))
      .filter((company) => matchesSearch([company.name, company.industry, company.location, company.website, company.status, company.tags.join(" ")].join(" "), query.search));
    const page = paginate(filteredCompanies, query);
    const visibleCompanyIds = new Set(page.data.map((company) => company.id));
    const contactsByCompany = new Map<string, Array<{ name: string; avatar: string | null }>>();

    for (const contact of contacts) {
      if (!contact.companyId || !visibleCompanyIds.has(contact.companyId)) continue;
      const companyContacts = contactsByCompany.get(contact.companyId) ?? [];
      companyContacts.push(toCompanyContactSummary(contact));
      contactsByCompany.set(contact.companyId, companyContacts);
    }

    res.status(200).json({
      data: page.data.map((company) => toCompanyDto(company, contactsByCompany.get(company.id) ?? [], req)),
      meta: page.meta,
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
    await publishCrmEvent({ tenantId, resource: "companies", action: "created", entityId: savedCompany.id, actorObjectId: req.session.user?.entraObjectId });

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
    await publishCrmEvent({ tenantId: savedCompany.tenantId, resource: "companies", action: "updated", entityId: savedCompany.id, actorObjectId: req.session.user?.entraObjectId });

    res.status(200).json({
      data: toCompanyDto(savedCompany, contacts.map(toCompanyContactSummary), req),
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
    await publishCrmEvent({ tenantId: company.tenantId, resource: "companies", action: "deleted", entityId: company.id, actorObjectId: req.session.user?.entraObjectId });
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

    const contentType = sharedResolveImageContentType(req.file);
    const objectKey = `companies/${company.id}/${randomUUID()}${sharedMimeExtension(contentType)}`;
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
    await publishCrmEvent({ tenantId: savedCompany.tenantId, resource: "companies", action: "updated", entityId: savedCompany.id, actorObjectId: req.session.user?.entraObjectId });
    res.status(200).json({
      data: toCompanyDto(savedCompany, contacts.map(toCompanyContactSummary), req),
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
    // The URL is stable while the object key changes after each upload.
    // Do not let browsers keep displaying the previous logo.
    res.setHeader("Cache-Control", "private, no-store");
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
