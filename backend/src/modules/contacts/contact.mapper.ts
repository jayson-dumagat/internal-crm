import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { normalizeUserName } from "../../shared/utils/names";
import { Company } from "../companies/company.entity";
import { Contact } from "./contact.entity";
import { User } from "../users/user.entity";
import { maskSensitive } from "../../shared/utils/privacy";

export function toContactDto(
  contact: Contact,
  company?: Company,
  owner?: User,
  req?: Request,
) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: contact.id,
    company_id: contact.companyId,
    user: {
      image:
        canSee("contacts.name") && contact.avatarUrl
          ? `/api/v1/contacts/${contact.id}/avatar`
          : null,
      name: canSee("contacts.name")
        ? contact.name
        : maskSensitive(contact.name),
    },
    position: contact.role ?? "—",
    company: {
      image:
        canSee("contacts.company") && company?.logoUrl
          ? `/api/v1/companies/${company.id}/logo`
          : null,
      name: canSee("contacts.company")
        ? (company?.name ?? contact.companyName ?? "Individual")
        : maskSensitive(company?.name ?? contact.companyName),
    },
    relationship_level: contact.relationshipLevel,
    contact: {
      email: canSee("contacts.email")
        ? contact.email
        : maskSensitive(contact.email),
      phone: contact.phone ?? "—",
    },
    owner: {
      image:
        canSee("contacts.owner") && owner?.avatarUrl
          ? `/api/v1/users/${owner.entraObjectId}/avatar`
          : null,
      name: canSee("contacts.owner")
        ? normalizeUserName(
            owner?.displayName ?? contact.relationshipOwner ?? "Unassigned",
          )
        : maskSensitive(owner?.displayName ?? contact.relationshipOwner),
    },
    relationship_owner_id: contact.relationshipOwnerId,
    source_lead_id: contact.sourceLeadId,
    location: contact.location ?? "—",
    status: contact.status,
    last_activity: contact.lastActivityAt?.toISOString() ?? null,
    type_of_client: canSee("contacts.preferences")
      ? contact.typeOfClient
      : null,
    risk_profile: canSee("contacts.preferences") ? contact.riskProfile : null,
    preferred_contact_method: canSee("contacts.preferences")
      ? contact.preferredContactMethod
      : null,
    tags: canSee("contacts.tags") ? (contact.tags ?? []) : [],
  };

  if (!canSee("contacts.phone"))
    dto.contact.phone = maskSensitive(contact.phone);
  if (!canSee("contacts.location"))
    dto.location = maskSensitive(contact.location);
  if (!canSee("contacts.position")) dto.position = maskSensitive(contact.role);
  if (!canSee("contacts.relationshipLevel"))
    dto.relationship_level = "Restricted";
  if (!canSee("contacts.status")) dto.status = "Restricted";
  if (!canSee("contacts.lastActivity")) dto.last_activity = null;

  return dto;
}
