import type { EntityManager } from "typeorm";

import { AppDataSource } from "../../database/data-source";
import { Activity } from "../activities/activity.entity";
import { Company } from "../companies/company.entity";
import { Contact } from "../contacts/contact.entity";
import { Lead } from "./lead.entity";
import { LeadStatus } from "./lead.types";

export class LeadConversionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 404 | 409,
    public readonly code: "lead_not_found" | "client_already_closed",
  ) {
    super(message);
    this.name = "LeadConversionError";
  }
}

export type ConvertLeadInput = {
  leadId: string;
  tenantId: string;
  actorId: string | null;
  actorObjectId: string | null;
  actorName: string;
  actorAvatarUrl: string | null;
  ipAddress: string | null;
};

export type ConvertedLeadResult = {
  lead: Lead;
  contact: Contact;
  activity: Activity | null;
  createdContact: boolean;
  alreadyConverted: boolean;
};

/**
 * Converts a lead into the canonical client/contact record.
 *
 * The lead is retained as acquisition history and linked to the contact.
 * Every database write, including the audit activity, runs in one transaction.
 * An advisory lock serializes conversions for the same tenant/email even when
 * two requests arrive before a contact exists.
 */
export async function convertLeadToClient(
  input: ConvertLeadInput,
): Promise<ConvertedLeadResult> {
  return AppDataSource.transaction("SERIALIZABLE", async (manager) => {
    await lockConversion(manager, `lead:${input.tenantId}:${input.leadId}`);

    const lead = await manager
      .getRepository(Lead)
      .createQueryBuilder("lead")
      .innerJoinAndSelect(
        "lead.owner",
        "owner",
        "owner.entra_tenant_id = :tenantId",
        { tenantId: input.tenantId },
      )
      .leftJoinAndSelect("lead.assignedTo", "assignedTo")
      .where("lead.id = :leadId", { leadId: input.leadId })
      .setLock("pessimistic_write")
      .getOne();

    if (!lead) {
      throw new LeadConversionError(
        "Lead not found.",
        404,
        "lead_not_found",
      );
    }

    if (lead.convertedContactId) {
      const convertedContact = await manager
        .getRepository(Contact)
        .findOneBy({ id: lead.convertedContactId, tenantId: input.tenantId });

      if (convertedContact) {
        return {
          lead,
          contact: convertedContact,
          activity: null,
          createdContact: false,
          alreadyConverted: true,
        };
      }
    }

    await lockConversion(
      manager,
      `email:${input.tenantId}:${lead.email.trim().toLowerCase()}`,
    );

    const contactRepository = manager.getRepository(Contact);
    const existingContact = await contactRepository
      .createQueryBuilder("contact")
      .where("contact.tenant_id = :tenantId", { tenantId: input.tenantId })
      .andWhere("LOWER(contact.email) = LOWER(:email)", {
        email: lead.email.trim(),
      })
      .setLock("pessimistic_write")
      .getOne();

    if (
      existingContact &&
      existingContact.status.toLowerCase() === "closed" &&
      existingContact.sourceLeadId !== lead.id
    ) {
      throw new LeadConversionError(
        "A closed client already exists with this email address.",
        409,
        "client_already_closed",
      );
    }

    const company = await findCompany(manager, input.tenantId, lead.companyName);
    const contact = existingContact ?? contactRepository.create({
      tenantId: input.tenantId,
      name: `${lead.firstName} ${lead.lastName}`.trim(),
      email: lead.email.trim(),
      phone: lead.phone,
      role: lead.jobTitle,
      companyId: company?.id ?? null,
      companyName: company?.name ?? lead.companyName,
      relationshipLevel: "Medium",
      relationshipOwner: lead.owner.displayName,
      relationshipOwnerId: lead.owner.entraObjectId,
      status: "Customer",
      tags: [],
      createdById: input.actorObjectId,
      sourceLeadId: lead.id,
      lastActivityAt: new Date(),
    });

    if (existingContact) {
      // Preserve the client record as the canonical source of truth. Only
      // fill fields that are missing rather than blindly copying lead data over
      // an already-maintained client profile.
      contact.name ||= `${lead.firstName} ${lead.lastName}`.trim();
      contact.phone ||= lead.phone;
      contact.role ||= lead.jobTitle;
      contact.companyId ||= company?.id ?? null;
      contact.companyName ||= company?.name ?? lead.companyName;
      contact.relationshipOwner ||= lead.owner.displayName;
      contact.relationshipOwnerId ||= lead.owner.entraObjectId;
      contact.sourceLeadId ||= lead.id;
      contact.status = "Customer";
      contact.lastActivityAt = new Date();
    }

    const savedContact = await contactRepository.save(contact);
    lead.status = LeadStatus.CONVERTED;
    lead.convertedContactId = savedContact.id;
    lead.convertedAt = new Date();
    lead.lastActivityAt = new Date();
    lead.updatedById = input.actorId;
    const savedLead = await manager.getRepository(Lead).save(lead);

    const activity = await manager.getRepository(Activity).save(
      manager.getRepository(Activity).create({
        tenantId: input.tenantId,
        actorId: input.actorId,
        actorName: input.actorName,
        actorAvatarUrl: input.actorAvatarUrl,
        action: "converted lead to client",
        target: `${savedLead.firstName} ${savedLead.lastName}`.trim(),
        category: "Client",
        outcome: "Success",
        ipAddress: input.ipAddress,
        details: `Client contact ${savedContact.id} was ${existingContact ? "linked" : "created"} from lead ${savedLead.id}.`,
      }),
    );

    return {
      lead: savedLead,
      contact: savedContact,
      activity,
      createdContact: !existingContact,
      alreadyConverted: false,
    };
  });
}

async function findCompany(
  manager: EntityManager,
  tenantId: string,
  companyName: string | null,
): Promise<Company | null> {
  if (!companyName?.trim()) return null;

  return manager
    .getRepository(Company)
    .createQueryBuilder("company")
    .where("company.tenant_id = :tenantId", { tenantId })
    .andWhere("LOWER(company.name) = LOWER(:name)", {
      name: companyName.trim(),
    })
    .getOne();
}

async function lockConversion(
  manager: EntityManager,
  lockKey: string,
): Promise<void> {
  await manager.query(
    "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
    [lockKey],
  );
}
