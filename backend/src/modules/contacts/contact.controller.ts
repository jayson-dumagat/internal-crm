import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { AppDataSource } from "../../database/data-source";
import { getObject, putObject, removeObject } from "../../config/storage";
import { Company } from "../companies/company.entity";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import { Contact } from "./contact.entity";
import { createContactSchema, updateContactSchema } from "./contact.schema";
import { canAccessRecord, canViewField, firstHiddenInput, getDataScope, hasResourceRestriction } from "../access/access-control";

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
      contactRepository().find({ where: { tenantId }, order: { createdAt: "DESC" } }),
      companyRepository().find({ where: { tenantId } }),
      userRepository().find({ where: { entraTenantId: tenantId, status: UserStatus.ACTIVE, isAccessEnabled: true } }),
    ]);
    const companiesById = new Map(companies.map((company) => [company.id, company]));
    const visibleContacts = contacts.filter((contact) => canAccessRecord(req, "contacts", contact.id)).filter((contact) => getDataScope(req, "contacts") === "own"
      ? contact.createdById === req.session.user?.entraObjectId
      : true);
    const ownersById = new Map(users.map((user) => [user.entraObjectId, user]));
    const ownersByName = new Map(
      users.flatMap((user) => [
        [user.displayName.toLowerCase(), user] as const,
        [normalizeUserName(user.displayName).toLowerCase(), user] as const,
      ]),
    );

    res.status(200).json({
      data: visibleContacts.map((contact) =>
        toContactDto(
          contact,
          contact.companyId ? companiesById.get(contact.companyId) : undefined,
          contact.relationshipOwnerId
            ? ownersById.get(contact.relationshipOwnerId)
            : contact.relationshipOwner
              ? ownersByName.get(contact.relationshipOwner.toLowerCase())
              : undefined,
          req,
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
    const requestTenantId = req.session.user?.tenantId;
    if (!requestTenantId) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    if (hasResourceRestriction(req, "contacts")) {
      res.status(403).json({ success: false, message: "You cannot create contacts while contact access is restricted to assigned records." });
      return;
    }
    const forbiddenField = firstHiddenInput(req, req.body, {
      name: "contacts.name", role: "contacts.position", companyId: "contacts.company", companyName: "contacts.company",
      email: "contacts.email", phone: "contacts.phone", relationshipLevel: "contacts.relationshipLevel",
      relationshipOwnerId: "contacts.owner", relationshipOwner: "contacts.owner", location: "contacts.location",
      typeOfClient: "contacts.preferences", riskProfile: "contacts.preferences", preferredContactMethod: "contacts.preferences",
      status: "contacts.status", tags: "contacts.tags",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
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
      const company = await companyRepository().findOneBy({ id: parsed.data.companyId, tenantId: requestTenantId });
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
      tenantId: requestTenantId,
      companyName,
      relationshipOwner: owner
        ? normalizeUserName(owner.displayName)
        : parsed.data.relationshipOwner,
      lastActivityAt: parsed.data.lastActivityAt
        ? new Date(parsed.data.lastActivityAt)
        : new Date(),
      createdById: req.session.user?.entraObjectId ?? null,
    });
    const savedContact = await contactRepository().save(contact);
    const company = savedContact.companyId
      ? await companyRepository().findOneBy({ id: savedContact.companyId, tenantId: requestTenantId })
      : undefined;

    res.status(201).json({ data: toContactDto(savedContact, company ?? undefined, owner, req) });
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
    if (!canAccessRecord(req, "contacts", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }
    const forbiddenField = firstHiddenInput(req, req.body, {
      name: "contacts.name", role: "contacts.position", companyId: "contacts.company", companyName: "contacts.company",
      email: "contacts.email", phone: "contacts.phone", relationshipLevel: "contacts.relationshipLevel",
      relationshipOwnerId: "contacts.owner", relationshipOwner: "contacts.owner", location: "contacts.location",
      typeOfClient: "contacts.preferences", riskProfile: "contacts.preferences", preferredContactMethod: "contacts.preferences",
      status: "contacts.status", tags: "contacts.tags",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
    const contactId = String(req.params.id);
    const contact = await contactRepository().findOneBy({ id: contactId, tenantId: req.session.user?.tenantId ?? "" });
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
        const company = await companyRepository().findOneBy({ id: companyId, tenantId: req.session.user?.tenantId ?? "" });
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
        contact.relationshipOwner = normalizeUserName(owner.displayName);
      } else {
        contact.relationshipOwner = parsed.data.relationshipOwner ?? null;
      }
    } else if ("relationshipOwner" in parsed.data) {
      contact.relationshipOwnerId = null;
    }

    const savedContact = await contactRepository().save(contact);
    const company = savedContact.companyId
      ? await companyRepository().findOneBy({ id: savedContact.companyId, tenantId: req.session.user?.tenantId ?? "" })
      : undefined;
    owner ??= savedContact.relationshipOwnerId
      ? await findRelationshipOwner(req, savedContact.relationshipOwnerId)
      : undefined;

    res.status(200).json({ data: toContactDto(savedContact, company ?? undefined, owner, req) });
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
    if (!canAccessRecord(req, "contacts", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }
    const contact = await contactRepository().findOneBy({ id: String(req.params.id), tenantId: req.session.user?.tenantId ?? "" });
    if (!contact) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    const result = await contactRepository().delete(contact.id);
    if (!result.affected) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    if (contact.avatarUrl) {
      await removeObject(contact.avatarUrl).catch((error) => {
        console.error("Failed to remove contact avatar from object storage", error);
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function uploadContactAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!canAccessRecord(req, "contacts", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Contact avatar not found." });
      return;
    }
    const contact = await contactRepository().findOneBy({ id: String(req.params.id), tenantId: req.session.user?.tenantId ?? "" });
    if (!contact) {
      res.status(404).json({ success: false, message: "Contact not found." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "Please select an image to upload." });
      return;
    }

    const contentType = resolveImageContentType(req.file);
    const extension = mimeExtension(contentType);
    const objectKey = `contacts/${contact.id}/${randomUUID()}${extension}`;
    await putObject(objectKey, req.file.buffer, contentType);

    const previousObjectKey = contact.avatarUrl;
    contact.avatarUrl = objectKey;
    contact.avatarContentType = contentType;
    const savedContact = await contactRepository().save(contact);

    if (previousObjectKey) {
      await removeObject(previousObjectKey).catch((error) => {
        console.error("Failed to remove previous contact avatar from object storage", error);
      });
    }

    const company = savedContact.companyId
      ? await companyRepository().findOneBy({ id: savedContact.companyId, tenantId: req.session.user?.tenantId ?? "" })
      : undefined;

    res.status(200).json({ data: toContactDto(savedContact, company ?? undefined, undefined, req) });
  } catch (error) {
    next(error);
  }
}

export async function getContactAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!canAccessRecord(req, "contacts", String(req.params.id))) {
      res.status(404).json({ success: false, message: "Contact avatar not found." });
      return;
    }
    if (!canViewField(req, "contacts.name")) {
      res.status(404).json({ success: false, message: "Contact avatar not found." });
      return;
    }
    const contact = await contactRepository().findOneBy({ id: String(req.params.id), tenantId: req.session.user?.tenantId ?? "" });
    if (!contact?.avatarUrl) {
      res.status(404).json({ success: false, message: "Contact avatar not found." });
      return;
    }

    const objectStream = await getObject(contact.avatarUrl);
    res.setHeader("Content-Type", contact.avatarContentType ?? "application/octet-stream");
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

function toContactDto(contact: Contact, company?: Company, owner?: User, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: contact.id,
    company_id: contact.companyId,
    user: {
      image: canSee("contacts.name") && contact.avatarUrl ? `/api/v1/contacts/${contact.id}/avatar` : null,
      name: canSee("contacts.name") ? contact.name : "Restricted",
    },
    position: contact.role ?? "—",
    company: {
      image: canSee("contacts.company") && company?.logoUrl ? `/api/v1/companies/${company.id}/logo` : null,
      name: canSee("contacts.company") ? company?.name ?? contact.companyName ?? "Individual" : "Restricted",
    },
    relationship_level: contact.relationshipLevel,
    contact: {
      email: canSee("contacts.email") ? contact.email : "Restricted",
      phone: contact.phone ?? "—",
    },
    owner: {
      image: canSee("contacts.owner") && owner?.avatarUrl
        ? `/api/v1/users/${owner.entraObjectId}/avatar`
        : null,
      name: canSee("contacts.owner") ? normalizeUserName(owner?.displayName ?? contact.relationshipOwner ?? "Unassigned") : "Restricted",
    },
    relationship_owner_id: contact.relationshipOwnerId,
    location: contact.location ?? "—",
    status: contact.status,
    last_activity: contact.lastActivityAt
      ? contact.lastActivityAt.toISOString().slice(0, 10)
      : "—",
    type_of_client: canSee("contacts.preferences") ? contact.typeOfClient : null,
    risk_profile: canSee("contacts.preferences") ? contact.riskProfile : null,
    preferred_contact_method: canSee("contacts.preferences") ? contact.preferredContactMethod : null,
    tags: canSee("contacts.tags") ? contact.tags ?? [] : [],
  };

  if (!canSee("contacts.phone")) dto.contact.phone = "Restricted";
  if (!canSee("contacts.location")) dto.location = "Restricted";
  if (!canSee("contacts.position")) dto.position = "Restricted";
  if (!canSee("contacts.relationshipLevel")) dto.relationship_level = "Restricted";
  if (!canSee("contacts.status")) dto.status = "Restricted";
  if (!canSee("contacts.lastActivity")) dto.last_activity = "Restricted";

  return {
    ...dto,
    last_activity: canSee("contacts.lastActivity") ? contact.lastActivityAt?.toISOString() ?? null : null,
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

function normalizeUserName(name: string): string {
  return name.replace(/\s*\(CGSI\)\s*$/i, "").trim() || name.trim();
}
