import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { User } from "../users/user.entity";
import { Lead } from "./lead.entity";
import { LeadInterestLevel, LeadStatus } from "./lead.types";
import { titleCase } from "../../shared/utils/names";
import { maskSensitive } from "../../shared/utils/privacy";

export function toLeadDto(lead: Lead, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: lead.id,
    name: canSee("leads.name") ? formatLeadName(lead) : maskSensitive(formatLeadName(lead)),
    avatar:
      canSee("leads.name") && lead.avatarUrl
        ? `/api/v1/leads/${lead.id}/avatar`
        : null,
    role: lead.jobTitle ?? "—",
    lastActivity: lead.lastActivityAt?.toISOString() ?? lead.updatedAt.toISOString(),
    email: lead.email,
    phone: lead.phone ?? "—",
    company: lead.companyName ?? "Individual",
    source: lead.source ?? "Manual",
    annualRevenue: lead.annualRevenue ?? "—",
    owner: canSee("leads.owner") ? toUserDto(lead.owner) : toUserDto(null),
    ownerId: lead.owner?.entraObjectId ?? null,
    status: titleCase(lead.status),
    interestLevel: titleCase(lead.interestLevel),
    dateCreated: lead.createdAt.toISOString(),
    address:
      [
        lead.addressLine1,
        lead.addressLine2,
        lead.city,
        lead.stateProvince,
        lead.postalCode,
        lead.country,
      ].filter(Boolean).join(", ") || "—",
    assignedToId: lead.assignedTo?.entraObjectId ?? null,
    assignedTo: canSee("leads.assignedTo")
      ? toUserDto(lead.assignedTo)
      : toUserDto(null),
    convertedContactId: lead.convertedContactId,
    convertedAt: lead.convertedAt?.toISOString() ?? null,
  };

  if (!canSee("leads.email")) dto.email = maskSensitive(lead.email);
  if (!canSee("leads.phone")) dto.phone = maskSensitive(lead.phone);
  if (!canSee("leads.company")) dto.company = maskSensitive(lead.companyName);
  if (!canSee("leads.address")) dto.address = maskSensitive(dto.address);
  if (!canSee("leads.revenue")) dto.annualRevenue = maskSensitive(lead.annualRevenue);
  if (!canSee("leads.role")) dto.role = maskSensitive(lead.jobTitle);
  if (!canSee("leads.source")) dto.source = maskSensitive(lead.source);
  if (!canSee("leads.status")) dto.status = "Restricted";
  if (!canSee("leads.interestLevel")) dto.interestLevel = "Restricted";
  if (!canSee("leads.dateCreated")) dto.dateCreated = "";

  return dto;
}

export function toUserDto(user: User | null | undefined) {
  return {
    id: user?.entraObjectId ?? null,
    name:
      user?.displayName?.replace(/\s*\(CGSI\)\s*$/i, "").trim() ||
      "Unassigned",
    avatar: user?.avatarUrl
      ? `/api/v1/users/${user.entraObjectId}/avatar`
      : null,
  };
}

export function formatLeadName(lead: Lead): string {
  const hasNoLastName = lead.lastName === "—" || lead.lastName === "â€”";
  return `${lead.firstName} ${hasNoLastName ? "" : lead.lastName}`.trim();
}

export function toLeadStatus(value?: string): LeadStatus {
  return (value ? value.toLowerCase() : LeadStatus.NEW) as LeadStatus;
}

export function toInterestLevel(value?: string): LeadInterestLevel {
  return (value ? value.toLowerCase() : LeadInterestLevel.LOW) as LeadInterestLevel;
}
