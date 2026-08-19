import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { User } from "../users/user.entity";
import { Activity } from "./activity.entity";
import { createActivitySchema } from "./activity.schema";
import { canAccessRecord, firstHiddenInput, hasResourceRestriction } from "../access/access-control";
import { toActivityDto } from "./activity.mapper";
import { canViewTenantActivityLog } from "./activity.service";
import { getListQuery, matchesDateRange, matchesQuery, matchesSearch, matchesStatus, paginate } from "../../shared/utils/list-query";

const activityRepository = () => AppDataSource.getRepository(Activity);
const userRepository = () => AppDataSource.getRepository(User);

export async function listActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const sessionUser = req.session.user;
    const canViewAll = canViewTenantActivityLog(sessionUser?.roles ?? []);
    let where: { tenantId: string; actorId?: string } = { tenantId };

    if (!canViewAll) {
      const actor = await userRepository().findOne({
        where: {
          entraTenantId: tenantId,
          entraObjectId: sessionUser?.entraObjectId,
        },
        select: { id: true },
      });

      // Records without a matching CRM user cannot be attributed safely to
      // the requester, so they are excluded from the personal activity view.
      if (!actor) {
        res.status(200).json({ data: [] });
        return;
      }
      where = { tenantId, actorId: actor.id };
    }

    const query = getListQuery(req, 50);
    const activities = await activityRepository().find({
      where,
      order: { createdAt: "DESC" },
      take: 500,
    });
    const visible = activities.filter((activity) => canAccessRecord(req, "activities", activity.id))
      .filter((activity) => !query.category || activity.category === query.category)
      .filter((activity) => matchesStatus(activity.outcome, query.outcome ?? query.status))
      .filter((activity) => matchesDateRange(activity.createdAt, query.dateFrom, query.dateTo))
      .filter((activity) => matchesQuery(activity.actorName, query.actor))
      .filter((activity) => matchesQuery(activity.action, query.action))
      .filter((activity) => matchesQuery(activity.target, query.target))
      .filter((activity) => matchesSearch([activity.actorName, activity.action, activity.target, activity.category, activity.outcome, activity.ipAddress].join(" "), query.search));
    const page = paginate(visible, query);
    res.status(200).json({ data: page.data.map((activity) => toActivityDto(activity, req)), meta: page.meta });
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
