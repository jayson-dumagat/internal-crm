import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { User } from "../users/user.entity";
import { Activity } from "./activity.entity";
import { createActivitySchema } from "./activity.schema";
import { canAccessRecord, canViewField, firstHiddenInput, hasResourceRestriction } from "../access/access-control";

const activityRepository = () => AppDataSource.getRepository(Activity);
const userRepository = () => AppDataSource.getRepository(User);

export async function listActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const activities = await activityRepository().find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: 500,
    });
    res.status(200).json({ data: activities.filter((activity) => canAccessRecord(req, "activities", activity.id)).map((activity) => toActivityDto(activity, req)) });
  } catch (error) {
    next(error);
  }
}

export async function createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (hasResourceRestriction(req, "activities")) {
      res.status(403).json({ success: false, message: "You cannot create activities while activity access is restricted to assigned records." });
      return;
    }
    const forbiddenField = firstHiddenInput(req, req.body, {
      action: "activities.action", target: "activities.target", category: "activities.category",
      outcome: "activities.outcome", ipAddress: "activities.ipAddress", details: "activities.details",
    });
    if (forbiddenField) { res.status(403).json({ success: false, message: `You cannot write the restricted field ${forbiddenField}.` }); return; }
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const parsed = createActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the activity fields and try again.", errors: parsed.error.issues });
      return;
    }

    const actor = await userRepository().findOne({
      where: { entraTenantId: sessionUser.tenantId, entraObjectId: sessionUser.entraObjectId },
    });
    const activity = activityRepository().create({
      ...parsed.data,
      tenantId: sessionUser.tenantId,
      actorId: actor?.id ?? null,
      actorName: actor?.displayName ?? sessionUser.name,
      actorAvatarUrl: actor?.avatarUrl ? `/api/v1/users/${actor.entraObjectId}/avatar` : null,
      ipAddress: parsed.data.ipAddress ?? req.ip ?? null,
      details: parsed.data.details ?? null,
    });
    const saved = await activityRepository().save(activity);
    res.status(201).json({ data: toActivityDto(saved, req) });
  } catch (error) {
    next(error);
  }
}

export function toActivityDto(activity: Activity, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: activity.id,
    actor: canSee("activities.actor") ? activity.actorName.replace(/\s*\(CGSI\)\s*$/i, "").trim() : "Restricted",
    avatar: activity.actorAvatarUrl,
    action: activity.action,
    target: canSee("activities.target") ? activity.target : "Restricted",
    category: activity.category,
    outcome: activity.outcome,
    timestamp: activity.createdAt.toISOString(),
    ipAddress: canSee("activities.ipAddress") ? activity.ipAddress ?? "Internal" : "Restricted",
    details: canSee("activities.details") ? activity.details ?? "" : "Restricted",
  };
  if (!canSee("activities.action")) dto.action = "Restricted";
  if (!canSee("activities.category")) dto.category = "System";
  if (!canSee("activities.outcome")) dto.outcome = "Warning";
  return dto;
}
