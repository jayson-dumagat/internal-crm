import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { AppDataSource } from "../../database/data-source";
import { getObject, putObject, removeObject } from "../../config/storage";
import {
  mimeExtension as sharedMimeExtension,
  resolveImageContentType as sharedResolveImageContentType,
  inferImageContentType as sharedInferImageContentType,
} from "../../shared/utils/media";
import { splitPersonName as sharedSplitPersonName } from "../../shared/utils/names";
import { recordActivity } from "../activities/activity.service";
import { publishCrmEvent } from "../../services/realtime-events";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import { hasRbacPermission } from "../access/rbac";
import { Company } from "../companies/company.entity";
import { toContactDto } from "../contacts/contact.mapper";
import { Lead } from "./lead.entity";
import { createLeadSchema, updateLeadSchema } from "./lead.schema";
import {
  convertLeadToClient as convertLeadToClientRecord,
  LeadConversionError,
} from "./lead-conversion.service";
import { canAccessRecord, canViewField, firstHiddenInput, getDataScope, hasResourceRestriction } from "../access/access-control";
import {
  formatLeadName as formatLeadNameDto,
  toInterestLevel as mapInterestLevel,
  toLeadDto as mapLeadDto,
  toLeadStatus as mapLeadStatus,
} from "./lead.mapper";
import { getListQuery, matchesQuery, matchesSearch, matchesStatus, paginate } from "../../shared/utils/list-query";
import { publishNotification } from "../../services/notifications";

const leadRepository = () => AppDataSource.getRepository(Lead);
const userRepository = () => AppDataSource.getRepository(User);
const companyRepository = () => AppDataSource.getRepository(Company);

async function getCurrentUser(req: Request) {
  const sessionUser = req.session.user;
  if (!sessionUser) return null;
  return userRepository().findOne({
    where: {
      entraTenantId: sessionUser.tenantId,
      entraObjectId: sessionUser.entraObjectId,
      status: UserStatus.ACTIVE,
      isAccessEnabled: true,
    },
  });
}

async function getAssignedUser(req: Request, entraObjectId?: string | null) {
  if (!entraObjectId) return null;
  const tenantId = req.session.user?.tenantId;
  if (!tenantId) return null;
  return userRepository().findOne({
    where: { entraTenantId: tenantId, entraObjectId, status: UserStatus.ACTIVE, isAccessEnabled: true },
  });
}

export async function listLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.session.user) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const query = getListQuery(req, 25);
    const leads = await leadRepository().find({
      where: { owner: { entraTenantId: req.session.user.tenantId } },
      relations: { owner: true, assignedTo: true },
      order: { createdAt: "DESC" },
    });
    const scope = getDataScope(req, "leads");
    const visibleLeads = leads.filter((lead) => canAccessRecord(req, "leads", lead.id)).filter((lead) => scope === "own"
      ? lead.owner?.entraObjectId === req.session.user?.entraObjectId
      : scope === "assigned"
        ? lead.owner?.entraObjectId === req.session.user?.entraObjectId || lead.assignedTo?.entraObjectId === req.session.user?.entraObjectId
        : true);
    const filtered = visibleLeads.filter((lead) => matchesStatus(lead.status, query.status))
      .filter((lead) => matchesQuery(lead.jobTitle, query.role))
      .filter((lead) => matchesQuery(lead.companyName, query.company))
      .filter((lead) => !query.assignedTo || lead.assignedTo?.entraObjectId === query.assignedTo || matchesQuery(lead.assignedTo?.displayName, query.assignedTo))
      .filter((lead) => matchesQuery(lead.interestLevel, query.interestLevel))
      .filter((lead) => matchesSearch([formatLeadNameDto(lead), lead.email, lead.phone, lead.companyName, lead.jobTitle, lead.source, lead.status, lead.interestLevel].join(" "), query.search));
    const page = paginate(filtered, query);
    res.status(200).json({ data: page.data.map((lead) => mapLeadDto(lead, req)), meta: page.meta });
  } catch (error) {
    next(error);
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (hasResourceRestriction(req, "leads")) {
      res.status(403).json({ success: false, message: "You cannot create leads while your lead access is restricted to assigned records." });
      return;
    }
    const forbiddenField = firstHiddenInput(req, req.body, {
      name: "leads.name", role: "leads.role", email: "leads.email", phone: "leads.phone", company: "leads.company",
      source: "leads.source", annualRevenue: "leads.revenue", status: "leads.status", interestLevel: "leads.interestLevel",
      address: "leads.address", assignedToId: "leads.assignedTo",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      res.status(400).json({ success: false, message: "Your user profile is not ready yet. Please retry." });
      return;
    }
    const parsed = createLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the lead fields and try again.", errors: parsed.error.issues });
      return;
    }
    // New leads default to the signed-in relationship manager. Sending null
    // explicitly keeps the lead unassigned.
    const requestedAssigneeId = parsed.data.assignedToId === undefined
      ? sessionUser.entraObjectId
      : parsed.data.assignedToId;
    const assignedTo = await getAssignedUser(req, requestedAssigneeId);
    if (requestedAssigneeId && !assignedTo) {
      res.status(400).json({ success: false, message: "The selected assignee was not found." });
      return;
    }
    const { firstName, lastName } = sharedSplitPersonName(parsed.data.name);
    const lead = leadRepository().create({
      firstName,
      lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      jobTitle: parsed.data.role || null,
      companyName: parsed.data.company || null,
      annualRevenue: parsed.data.annualRevenue || null,
      source: parsed.data.source || "Manual",
      status: mapLeadStatus(parsed.data.status),
      interestLevel: mapInterestLevel(parsed.data.interestLevel),
      addressLine1: parsed.data.address || null,
      ownerId: currentUser.id,
      owner: currentUser,
      assignedToId: assignedTo?.id ?? null,
      assignedTo: assignedTo ?? null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      lastActivityAt: new Date(),
    });
    const saved = await leadRepository().save(lead);
    await recordActivity({
      tenantId: sessionUser.tenantId,
      actorId: currentUser.id,
      actorObjectId: sessionUser.entraObjectId,
      resource: "leads",
      entityId: saved.id,
      actorName: currentUser.displayName,
      actorAvatarUrl: currentUser.avatarUrl ? `/api/v1/users/${currentUser.entraObjectId}/avatar` : null,
      action: "created lead",
      target: formatLeadNameDto(saved),
      category: "Client",
      ipAddress: req.ip,
      details: saved.companyName ? `Company: ${saved.companyName}.` : null,
    });
    res.status(201).json({ data: mapLeadDto(saved, req) });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const forbiddenField = firstHiddenInput(req, req.body, {
      name: "leads.name", role: "leads.role", email: "leads.email", phone: "leads.phone", company: "leads.company",
      source: "leads.source", annualRevenue: "leads.revenue", status: "leads.status", interestLevel: "leads.interestLevel",
      address: "leads.address", assignedToId: "leads.assignedTo",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const currentUser = await getCurrentUser(req);
    const lead = await leadRepository().findOne({ where: { id: String(req.params.id), owner: { entraTenantId: sessionUser.tenantId } }, relations: { owner: true, assignedTo: true } });
    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }
    if (!canAccessRecord(req, "leads", lead.id)) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the lead fields and try again.", errors: parsed.error.issues });
      return;
    }
    if (parsed.data.name !== undefined) {
      const names = sharedSplitPersonName(parsed.data.name);
      lead.firstName = names.firstName;
      lead.lastName = names.lastName;
    }
    if (parsed.data.role !== undefined) lead.jobTitle = parsed.data.role || null;
    if (parsed.data.email !== undefined) lead.email = parsed.data.email;
    if (parsed.data.phone !== undefined) lead.phone = parsed.data.phone || null;
    if (parsed.data.company !== undefined) lead.companyName = parsed.data.company || null;
    if (parsed.data.source !== undefined) lead.source = parsed.data.source || null;
    if (parsed.data.annualRevenue !== undefined) lead.annualRevenue = parsed.data.annualRevenue || null;
    if (parsed.data.address !== undefined) lead.addressLine1 = parsed.data.address || null;
    if (parsed.data.status !== undefined) lead.status = mapLeadStatus(parsed.data.status);
    if (parsed.data.interestLevel !== undefined) lead.interestLevel = mapInterestLevel(parsed.data.interestLevel);
    if (parsed.data.assignedToId !== undefined) {
      const assignedTo = await getAssignedUser(req, parsed.data.assignedToId);
      if (parsed.data.assignedToId && !assignedTo) {
        res.status(400).json({ success: false, message: "The selected assignee was not found." });
        return;
      }
      lead.assignedToId = assignedTo?.id ?? null;
      lead.assignedTo = assignedTo;
    }
    lead.updatedById = currentUser?.id ?? null;
    lead.lastActivityAt = new Date();
    const saved = await leadRepository().save(lead);
    if (currentUser) {
      await recordActivity({
        tenantId: sessionUser.tenantId,
        actorId: currentUser.id,
        actorObjectId: sessionUser.entraObjectId,
        resource: "leads",
        entityId: saved.id,
        actorName: currentUser.displayName,
        actorAvatarUrl: currentUser.avatarUrl ? `/api/v1/users/${currentUser.entraObjectId}/avatar` : null,
        action: "updated lead",
        target: formatLeadNameDto(saved),
        category: "Client",
        ipAddress: req.ip,
      });
    }
    res.status(200).json({ data: mapLeadDto(saved, req) });
  } catch (error) {
    next(error);
  }
}

export async function convertLeadToClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    // Conversion writes the canonical contact/client record, so it requires
    // write access to both sides of the lifecycle.
    const permissions = sessionUser.permissions ?? [];
    if (
      !hasRbacPermission(permissions, "contacts.create") ||
      !hasRbacPermission(permissions, "contacts.update")
    ) {
      res.status(403).json({
        success: false,
        message: "You need contact create and update access to convert a lead into a client.",
        code: "contact_write_permission_required",
      });
      return;
    }

    const currentUser = await getCurrentUser(req);
    const result = await convertLeadToClientRecord({
      leadId: String(req.params.id),
      tenantId: sessionUser.tenantId,
      actorId: currentUser?.id ?? null,
      actorObjectId: sessionUser.entraObjectId,
      actorName: currentUser?.displayName ?? sessionUser.name,
      actorAvatarUrl: currentUser?.avatarUrl
        ? `/api/v1/users/${sessionUser.entraObjectId}/avatar`
        : null,
      ipAddress: req.ip ?? null,
    });

    const company = result.contact.companyId
      ? await companyRepository().findOneBy({
          id: result.contact.companyId,
          tenantId: sessionUser.tenantId,
        })
      : undefined;
    const contactOwner = result.contact.relationshipOwnerId
      ? await userRepository().findOne({
          where: {
            entraTenantId: sessionUser.tenantId,
            entraObjectId: result.contact.relationshipOwnerId,
            status: UserStatus.ACTIVE,
            isAccessEnabled: true,
          },
        })
      : undefined;

    if (result.activity) {
      await publishNotification({
        tenantId: sessionUser.tenantId,
        id: result.activity.id,
        actorObjectId: sessionUser.entraObjectId,
        title: result.activity.action,
        message: `${result.activity.actorName} ${result.activity.action} ${result.activity.target}`,
        category: result.activity.category,
        createdAt: result.activity.createdAt,
      }).catch((error) => console.error("Failed to publish lead conversion notification", error));

      await publishCrmEvent({
        tenantId: sessionUser.tenantId,
        resource: "leads",
        action: "updated",
        entityId: result.lead.id,
        actorObjectId: sessionUser.entraObjectId,
      }).catch((error) =>
        console.error("Failed to publish lead conversion event", error),
      );
      await publishCrmEvent({
        tenantId: sessionUser.tenantId,
        resource: "contacts",
        action: result.createdContact ? "created" : "updated",
        entityId: result.contact.id,
        actorObjectId: sessionUser.entraObjectId,
      }).catch((error) =>
        console.error("Failed to publish client conversion event", error),
      );
    }

    res.status(result.alreadyConverted ? 200 : 201).json({
      data: {
        lead: mapLeadDto(result.lead, req),
        client: toContactDto(result.contact, company ?? undefined, contactOwner ?? undefined, req),
        createdClient: result.createdContact,
        alreadyConverted: result.alreadyConverted,
      },
    });
  } catch (error) {
    if (error instanceof LeadConversionError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }
    next(error);
  }
}

export async function deleteLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const lead = await leadRepository().findOne({ where: { id: String(req.params.id), owner: { entraTenantId: sessionUser.tenantId } }, relations: { owner: true } });
    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }
    if (!canAccessRecord(req, "leads", lead.id)) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }
    await leadRepository().delete(lead.id);
    if (lead.avatarUrl) {
      await removeObject(lead.avatarUrl).catch((error) => console.error("Failed to remove lead avatar from object storage", error));
    }
    await publishCrmEvent({ tenantId: sessionUser.tenantId, resource: "leads", action: "deleted", entityId: lead.id, actorObjectId: sessionUser.entraObjectId });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function uploadLeadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const lead = await leadRepository().findOne({
      where: { id: String(req.params.id), owner: { entraTenantId: sessionUser.tenantId } },
      relations: { owner: true, assignedTo: true },
    });
    if (!lead) {
      res.status(404).json({ success: false, message: "Lead not found." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, message: "Please select an image to upload." });
      return;
    }

    const contentType = sharedResolveImageContentType(req.file);
    const objectKey = `leads/${lead.id}/${randomUUID()}${sharedMimeExtension(contentType)}`;
    await putObject(objectKey, req.file.buffer, contentType);

    const previousObjectKey = lead.avatarUrl;
    lead.avatarUrl = objectKey;
    const savedLead = await leadRepository().save(lead);
    if (previousObjectKey) {
      await removeObject(previousObjectKey).catch((error) => console.error("Failed to remove previous lead avatar", error));
    }
    await publishCrmEvent({ tenantId: sessionUser.tenantId, resource: "leads", action: "updated", entityId: savedLead.id, actorObjectId: sessionUser.entraObjectId });

    res.status(200).json({ data: mapLeadDto(savedLead, req) });
  } catch (error) {
    next(error);
  }
}

export async function getLeadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!canViewField(req, "leads.name")) {
      res.status(404).json({ success: false, message: "Lead avatar not found." });
      return;
    }
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const lead = await leadRepository().findOne({ where: { id: String(req.params.id), owner: { entraTenantId: sessionUser.tenantId } } });
    if (!lead?.avatarUrl) {
      res.status(404).json({ success: false, message: "Lead avatar not found." });
      return;
    }
    if (!canAccessRecord(req, "leads", lead.id)) {
      res.status(404).json({ success: false, message: "Lead avatar not found." });
      return;
    }

    const objectStream = await getObject(lead.avatarUrl);
    res.setHeader("Content-Type", sharedInferImageContentType(lead.avatarUrl));
    res.setHeader("Cache-Control", "private, no-store");
    objectStream.on("error", (error) => {
      if (res.headersSent) res.destroy(error);
      else next(error);
    });
    objectStream.pipe(res);
  } catch (error) {
    next(error);
  }
}
