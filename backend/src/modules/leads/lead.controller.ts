import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { recordActivity } from "../activities/activity.service";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import { Lead } from "./lead.entity";
import { LeadInterestLevel, LeadStatus } from "./lead.types";
import { createLeadSchema, updateLeadSchema } from "./lead.schema";

const leadRepository = () => AppDataSource.getRepository(Lead);
const userRepository = () => AppDataSource.getRepository(User);

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
    const leads = await leadRepository().find({
      where: { owner: { entraTenantId: req.session.user.tenantId } },
      relations: { owner: true, assignedTo: true },
      order: { createdAt: "DESC" },
    });
    res.status(200).json({ data: leads.map(toLeadDto) });
  } catch (error) {
    next(error);
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
    const assignedTo = await getAssignedUser(req, parsed.data.assignedToId);
    if (parsed.data.assignedToId && !assignedTo) {
      res.status(400).json({ success: false, message: "The selected assignee was not found." });
      return;
    }
    const { firstName, lastName } = splitName(parsed.data.name);
    const lead = leadRepository().create({
      firstName,
      lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      jobTitle: parsed.data.role || null,
      companyName: parsed.data.company || null,
      annualRevenue: parsed.data.annualRevenue || null,
      source: parsed.data.source || "Manual",
      status: toLeadStatus(parsed.data.status),
      interestLevel: toInterestLevel(parsed.data.interestLevel),
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
      actorName: currentUser.displayName,
      actorAvatarUrl: currentUser.avatarUrl ? `/api/v1/users/${currentUser.entraObjectId}/avatar` : null,
      action: "created lead",
      target: formatLeadName(saved),
      category: "Client",
      ipAddress: req.ip,
      details: saved.companyName ? `Company: ${saved.companyName}.` : null,
    });
    res.status(201).json({ data: toLeadDto(saved) });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the lead fields and try again.", errors: parsed.error.issues });
      return;
    }
    if (parsed.data.name !== undefined) {
      const names = splitName(parsed.data.name);
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
    if (parsed.data.status !== undefined) lead.status = toLeadStatus(parsed.data.status);
    if (parsed.data.interestLevel !== undefined) lead.interestLevel = toInterestLevel(parsed.data.interestLevel);
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
        actorName: currentUser.displayName,
        actorAvatarUrl: currentUser.avatarUrl ? `/api/v1/users/${currentUser.entraObjectId}/avatar` : null,
        action: "updated lead",
        target: formatLeadName(saved),
        category: "Client",
        ipAddress: req.ip,
      });
    }
    res.status(200).json({ data: toLeadDto(saved) });
  } catch (error) {
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
    await leadRepository().delete(lead.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

function toLeadDto(lead: Lead) {
  return {
    id: lead.id,
    name: formatLeadName(lead),
    avatar: lead.avatarUrl,
    role: lead.jobTitle ?? "—",
    lastActivity: lead.lastActivityAt?.toISOString() ?? lead.updatedAt.toISOString(),
    email: lead.email,
    phone: lead.phone ?? "—",
    company: lead.companyName ?? "Individual",
    source: lead.source ?? "Manual",
    annualRevenue: lead.annualRevenue ?? undefined,
    owner: toUserDto(lead.owner),
    status: titleCase(lead.status),
    interestLevel: titleCase(lead.interestLevel),
    dateCreated: lead.createdAt.toISOString(),
    address: [lead.addressLine1, lead.addressLine2, lead.city, lead.stateProvince, lead.postalCode, lead.country].filter(Boolean).join(", ") || "—",
    assignedTo: toUserDto(lead.assignedTo),
  };
}

function toUserDto(user: User | null | undefined) {
  return {
    name: user?.displayName?.replace(/\s*\(CGSI\)\s*$/i, "").trim() || "Unassigned",
    avatar: user?.avatarUrl ? `/api/v1/users/${user.entraObjectId}/avatar` : null,
  };
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() ?? name.trim(), lastName: parts.join(" ") || "—" };
}

function formatLeadName(lead: Lead) {
  return `${lead.firstName} ${lead.lastName === "—" ? "" : lead.lastName}`.trim();
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function toLeadStatus(value?: string): LeadStatus {
  return (value ? value.toLowerCase() : LeadStatus.NEW) as LeadStatus;
}

function toInterestLevel(value?: string): LeadInterestLevel {
  return (value ? value.toLowerCase() : LeadInterestLevel.LOW) as LeadInterestLevel;
}
