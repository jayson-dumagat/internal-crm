import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { Company } from "./company.entity";
import type { CompanyContactSummary } from "./company.types";
import { maskSensitive } from "../../shared/utils/privacy";

export function toCompanyDto(
  company: Company,
  contacts: CompanyContactSummary[],
  req?: Request,
) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: company.id,
    name: canSee("companies.name") ? company.name : maskSensitive(company.name),
    industry: company.industry ?? "—",
    location: company.location ?? "—",
    employees: company.employees ?? "—",
    revenue: company.revenue ?? "—",
    contacts: canSee("companies.contacts") ? contacts : [],
    website: company.website ?? "—",
    customerSince: company.customerSince ?? "—",
    tags: canSee("companies.tags") ? (company.tags ?? []) : [],
    status: company.status,
    lastActivity: company.updatedAt?.toISOString() ?? null,
    logoUrl:
      canSee("companies.name") && company.logoUrl
        ? `/api/v1/companies/${company.id}/logo`
        : null,
  };

  if (!canSee("companies.revenue"))
    dto.revenue = maskSensitive(company.revenue);
  if (!canSee("companies.industry"))
    dto.industry = maskSensitive(company.industry);
  if (!canSee("companies.location"))
    dto.location = maskSensitive(company.location);
  if (!canSee("companies.employees"))
    dto.employees = maskSensitive(company.employees);
  if (!canSee("companies.website"))
    dto.website = maskSensitive(company.website);
  if (!canSee("companies.status")) dto.status = "Restricted";

  return {
    ...dto,
    customerSince: canSee("companies.customerSince")
      ? company.customerSince
      : null,
  };
}

export function toCompanyContactSummary(contact: {
  id: string;
  name: string;
  avatarUrl: string | null;
}): CompanyContactSummary {
  return {
    name: contact.name,
    avatar: contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
  };
}
