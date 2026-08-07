import { randomUUID } from "node:crypto";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { getObject, putObject, removeObject, statObject } from "../../config/storage";
import { Contact } from "../contacts/contact.entity";
import { Company } from "./company.entity";
import { createCompanySchema, updateCompanySchema } from "./company.schema";

const companyRepository = () => AppDataSource.getRepository(Company);
const contactRepository = () => AppDataSource.getRepository(Contact);

export async function listCompanies(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [companies, contacts] = await Promise.all([
      companyRepository().find({ order: { createdAt: "DESC" } }),
      contactRepository().find({ order: { createdAt: "ASC" } }),
    ]);

    const contactsByCompany = new Map<string, Array<{ name: string; avatar: string | null }>>();

    for (const contact of contacts) {
      if (!contact.companyId) continue;
      const companyContacts = contactsByCompany.get(contact.companyId) ?? [];
      companyContacts.push({
        name: contact.name,
        avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      });
      contactsByCompany.set(contact.companyId, companyContacts);
    }

    res.status(200).json({
      data: companies.map((company) => toCompanyDto(company, contactsByCompany.get(company.id) ?? [])),
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
      createdById: req.session.user?.entraObjectId ?? null,
    });
    const savedCompany = await companyRepository().save(company);

    res.status(201).json({ data: toCompanyDto(savedCompany, []) });
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
    const companyId = String(req.params.id);
    const company = await companyRepository().findOneBy({ id: companyId });
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
    const contacts = await contactRepository().find({ where: { companyId: savedCompany.id } });

    res.status(200).json({
      data: toCompanyDto(savedCompany, contacts.map((contact) => ({
        name: contact.name,
        avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      }))),
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
    const companyId = String(req.params.id);
    const company = await companyRepository().findOneBy({ id: companyId });
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
    const company = await companyRepository().findOneBy({ id: String(req.params.id) });
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

    const contacts = await contactRepository().find({ where: { companyId: savedCompany.id } });
    res.status(200).json({
      data: toCompanyDto(savedCompany, contacts.map((contact) => ({
        name: contact.name,
        avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      }))),
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
    const company = await companyRepository().findOneBy({ id: String(req.params.id) });
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
) {
  const dto = {
    id: company.id,
    name: company.name,
    industry: company.industry ?? "—",
    location: company.location ?? "—",
    employees: company.employees ?? "—",
    revenue: company.revenue ?? "—",
    contacts,
    website: company.website ?? "—",
    customerSince: company.customerSince ?? "—",
    tags: company.tags ?? [],
    status: company.status,
    lastActivity: company.updatedAt
      ? company.updatedAt.toISOString().slice(0, 10)
      : "—",
    logoUrl: company.logoUrl ? `/api/v1/companies/${company.id}/logo` : null,
  };

  return {
    ...dto,
    customerSince: company.customerSince,
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
