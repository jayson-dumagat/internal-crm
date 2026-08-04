import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
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

    const contactsByCompany = new Map<string, Array<{ name: string; avatar: string }>>();

    for (const contact of contacts) {
      if (!contact.companyId) continue;
      const companyContacts = contactsByCompany.get(contact.companyId) ?? [];
      companyContacts.push({
        name: contact.name,
        avatar: contact.avatarUrl ?? "/images/user/user-01.jpg",
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
        avatar: contact.avatarUrl ?? "/images/user/user-01.jpg",
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
    const result = await companyRepository().delete(companyId);
    if (!result.affected) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }

    await contactRepository().update({ companyId }, { companyId: null });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

function toCompanyDto(
  company: Company,
  contacts: Array<{ name: string; avatar: string }>,
) {
  return {
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
    logoUrl: company.logoUrl,
  };
}
