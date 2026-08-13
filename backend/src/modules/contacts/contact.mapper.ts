import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { normalizeUserName } from "../../shared/utils/names";
import { Company } from "../companies/company.entity";
import { Contact } from "./contact.entity";
import { User } from "../users/user.entity";

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
      name: canSee("contacts.name") ? contact.name : "Restricted",
    },
    position: contact.role ?? "—",
    company: {
      image:
        canSee("contacts.company") && company?.logoUrl
          ? `/api/v1/companies/${company.id}/logo`
          : null,
      name: canSee("contacts.company")
        ? company?.name ?? contact.companyName ?? "Individual"
        : "Restricted",
    },
    relationship_level: contact.relationshipLevel,
    contact: {
      email: canSee("contacts.email") ? contact.email : "Restricted",
      phone: contact.phone ?? "—",
    },
    owner: {
      image:
        canSee("contacts.owner") && owner?.avatarUrl
          ? `/api/v1/users/${owner.entraObjectId}/avatar`
          : null,
      name: canSee("contacts.owner")
        ? normalizeUserName(owner?.displayName ?? contact.relationshipOwner ?? "Unassigned")
        : "Restricted",
    },
    relationship_owner_id: contact.relationshipOwnerId,
    location: contact.location ?? "—",
    status: contact.status,
    last_activity: contact.lastActivityAt?.toISOString() ?? null,
    type_of_client: canSee("contacts.preferences") ? contact.typeOfClient : null,
    risk_profile: canSee("contacts.preferences") ? contact.riskProfile : null,
    preferred_contact_method: canSee("contacts.preferences")
      ? contact.preferredContactMethod
      : null,
    tags: canSee("contacts.tags") ? contact.tags ?? [] : [],
  };

  if (!canSee("contacts.phone")) dto.contact.phone = "Restricted";
  if (!canSee("contacts.location")) dto.location = "Restricted";
  if (!canSee("contacts.position")) dto.position = "Restricted";
  if (!canSee("contacts.relationshipLevel")) dto.relationship_level = "Restricted";
  if (!canSee("contacts.status")) dto.status = "Restricted";
  if (!canSee("contacts.lastActivity")) dto.last_activity = null;

  return dto;
}
