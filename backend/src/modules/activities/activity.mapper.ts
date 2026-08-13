import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { Activity } from "./activity.entity";

export function toActivityDto(activity: Activity, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: activity.id,
    actor: canSee("activities.actor")
      ? activity.actorName.replace(/\s*\(CGSI\)\s*$/i, "").trim()
      : "Restricted",
    avatar: activity.actorAvatarUrl,
    action: activity.action,
    target: canSee("activities.target") ? activity.target : "Restricted",
    category: activity.category,
    outcome: activity.outcome,
    timestamp: activity.createdAt.toISOString(),
    ipAddress: canSee("activities.ipAddress")
      ? activity.ipAddress ?? "Internal"
      : "Restricted",
    details: canSee("activities.details") ? activity.details ?? "" : "Restricted",
  };

  if (!canSee("activities.action")) dto.action = "Restricted";
  if (!canSee("activities.category")) dto.category = "System";
  if (!canSee("activities.outcome")) dto.outcome = "Warning";

  return dto;
}
