import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { Company } from "../companies/company.entity";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import { Contact } from "./contact.entity";
import { createContactSchema, updateContactSchema } from "./contact.schema";

const contactRepository = () => AppDataSource.getRepository(Contact);
const companyRepository = () => AppDataSource.getRepository(Company);
const userRepository = () => AppDataSource.getRepository(User);

export async function listContacts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const [contacts, companies, users] = await Promise.all([
      contactRepository().find({ order: { createdAt: "DESC" } }),
      companyRepository().find(),
      userRepository().find({ where: { entraTenantId: tenantId, status: UserStatus.ACTIVE, isAccessEnabled: true } }),
    ]);
    const companiesById = new Map(companies.map((company) => [company.id, company]));
    const ownersById = new Map(users.map((user) => [user.entraObjectId, user]));
    const ownersByName = new Map(users.map((user) => [user.displayName.toLowerCase(), user]));

    res.status(200).json({
      data: contacts.map((contact) =>
        toContactDto(
          contact,
          contact.companyId ? companiesById.get(contact.companyId) : undefined,
          contact.relationshipOwnerId
            ? ownersById.get(contact.relationshipOwnerId)
            : contact.relationshipOwner
              ? ownersByName.get(contact.relationshipOwner.toLowerCase())
              : undefined,
        ),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function createContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createContactSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Please check the contact fields and try again.",
        errors: parsed.error.issues,
      });
      return;
    }

    let companyName = parsed.data.companyName;
    if (parsed.data.companyId) {
      const company = await companyRepository().findOneBy({ id: parsed.data.companyId });
      if (!company) {
        res.status(400).json({ success: false, message: "The selected company was not found." });
        return;
      }
      companyName = company.name;
    }

    const owner = parsed.data.relationshipOwnerId
      ? await findRelationshipOwner(req, parsed.data.relationshipOwnerId)
      : undefined;
    if (parsed.data.relationshipOwnerId && !owner) {
      res.status(400).json({ success: false, message: "The selected relationship owner was not found." });
      return;
    }

    const contact = contactRepository().create({
      ...parsed.data,
      companyName,
      relationshipOwner: owner?.displayName ?? parsed.data.relationshipOwner,
      lastActivityAt: parsed.data.lastActivityAt
        ? new Date(parsed.data.lastActivityAt)
        : new Date(),
      createdById: req.session.user?.entraObjectId ?? null,
    });
    const savedContact = await contactRepository().save(contact);
    const company = savedContact.companyId
      ? await companyRepository().findOneBy({ id: savedContact.companyId })
      : undefined;

    res.status(201).json({ data: toContactDto(savedContact, company ?? undefined, owner) });
  } catch (error) {
    next(error);
  }
}

export async function updateContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const contactId = String(req.params.id);
    const contact = await contactRepository().findOneBy({ id: contactId });
    if (!contact) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    const parsed = updateContactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the contact fields and try again.", errors: parsed.error.issues });
      return;
    }

    const { companyId, companyName, lastActivityAt, relationshipOwnerId, ...rest } = parsed.data;
    Object.assign(contact, rest);

    if ("companyId" in parsed.data) {
      contact.companyId = companyId ?? null;
      if (companyId) {
        const company = await companyRepository().findOneBy({ id: companyId });
        if (!company) {
          res.status(400).json({ success: false, message: "The selected company was not found." });
          return;
        }
        contact.companyName = company.name;
      } else {
        contact.companyName = companyName ?? null;
      }
    } else if ("companyName" in parsed.data) {
      contact.companyName = companyName ?? null;
    }

    if ("lastActivityAt" in parsed.data) {
      contact.lastActivityAt = lastActivityAt ? new Date(lastActivityAt) : null;
    }

    let owner: User | undefined;
    if ("relationshipOwnerId" in parsed.data) {
      contact.relationshipOwnerId = relationshipOwnerId ?? null;
      if (relationshipOwnerId) {
        owner = await findRelationshipOwner(req, relationshipOwnerId);
        if (!owner) {
          res.status(400).json({ success: false, message: "The selected relationship owner was not found." });
          return;
        }
        contact.relationshipOwner = owner.displayName;
      } else {
        contact.relationshipOwner = parsed.data.relationshipOwner ?? null;
      }
    } else if ("relationshipOwner" in parsed.data) {
      contact.relationshipOwnerId = null;
    }

    const savedContact = await contactRepository().save(contact);
    const company = savedContact.companyId
      ? await companyRepository().findOneBy({ id: savedContact.companyId })
      : undefined;
    owner ??= savedContact.relationshipOwnerId
      ? await findRelationshipOwner(req, savedContact.relationshipOwnerId)
      : undefined;

    res.status(200).json({ data: toContactDto(savedContact, company ?? undefined, owner) });
  } catch (error) {
    next(error);
  }
}

export async function deleteContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await contactRepository().delete(String(req.params.id));
    if (!result.affected) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function findRelationshipOwner(req: Request, ownerId: string): Promise<User | undefined> {
  const tenantId = req.session.user?.tenantId;
  if (!tenantId) return undefined;

  return (await userRepository().findOneBy({
    entraTenantId: tenantId,
    entraObjectId: ownerId,
    status: UserStatus.ACTIVE,
    isAccessEnabled: true,
  })) ?? undefined;
}

function toContactDto(contact: Contact, company?: Company, owner?: User) {
  return {
    id: contact.id,
    company_id: contact.companyId,
    user: {
      image: contact.avatarUrl ?? "/images/user/user-01.jpg",
      name: contact.name,
    },
    position: contact.role ?? "—",
    company: {
      image: company?.logoUrl ?? "/images/user/user-01.jpg",
      name: company?.name ?? contact.companyName ?? "Individual",
    },
    relationship_level: contact.relationshipLevel,
    contact: {
      email: contact.email,
      phone: contact.phone ?? "—",
    },
    owner: {
      image: owner?.avatarUrl ?? "/images/user/user-01.jpg",
      name: owner?.displayName ?? contact.relationshipOwner ?? "Unassigned",
    },
    relationship_owner_id: contact.relationshipOwnerId,
    location: contact.location ?? "—",
    status: contact.status,
    last_activity: contact.lastActivityAt
      ? contact.lastActivityAt.toISOString().slice(0, 10)
      : "—",
    type_of_client: contact.typeOfClient,
    risk_profile: contact.riskProfile,
    preferred_contact_method: contact.preferredContactMethod,
    tags: contact.tags ?? [],
  };
}
