import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { Activity } from "./activity.entity";
import { maskSensitive } from "../../shared/utils/privacy";

export function toActivityDto(activity: Activity, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: activity.id,
    actor: canSee("activities.actor")
      ? activity.actorName.replace(/\s*\(CGSI\)\s*$/i, "").trim()
      : maskSensitive(activity.actorName),
    avatar: activity.actorAvatarUrl,
    action: activity.action,
    target: canSee("activities.target") ? activity.target : maskSensitive(activity.target),
    category: activity.category,
    outcome: activity.outcome,
    timestamp: activity.createdAt.toISOString(),
    ipAddress: canSee("activities.ipAddress")
      ? activity.ipAddress ?? "Internal"
      : maskSensitive(activity.ipAddress),
    details: canSee("activities.details") ? activity.details ?? "" : maskSensitive(activity.details),
  };

  if (!canSee("activities.action")) dto.action = maskSensitive(activity.action);
  if (!canSee("activities.category")) dto.category = "System";
  if (!canSee("activities.outcome")) dto.outcome = "Warning";

  return dto;
}
