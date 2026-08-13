import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { Lead } from "../leads/lead.entity";
import { User } from "../users/user.entity";
import { Task, TaskPriority, TaskStatus, TaskType } from "./task.entity";
import { fromTaskStatus } from "./task.types";

export function toTaskDto(task: Task, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: task.id,
    title: task.title,
    description: canSee("tasks.description") ? task.description : null,
    kind: task.kind,
    type: task.type,
    status: fromTaskStatus(task.status),
    priority: task.priority,
    color: task.color,
    startAt: task.startAt?.toISOString() ?? null,
    dueAt: task.dueAt?.toISOString() ?? null,
    reminderAt: task.reminderAt?.toISOString() ?? null,
    leadId: task.leadId,
    lead:
      canSee("tasks.lead") && task.lead
        ? { id: task.lead.id, name: formatLeadName(task.lead) }
        : null,
    assignee:
      canSee("tasks.assignee") && task.assignee
        ? {
            id: task.assignee.entraObjectId,
            name: task.assignee.displayName.replace(/\s*\(CGSI\)\s*$/i, "").trim(),
            avatar: task.assignee.avatarUrl
              ? `/api/v1/users/${task.assignee.entraObjectId}/avatar`
              : null,
          }
        : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };

  if (!canSee("tasks.title")) dto.title = "Restricted";
  if (!canSee("tasks.type")) dto.type = TaskType.GENERAL;
  if (!canSee("tasks.status")) dto.status = "not-started";
  if (!canSee("tasks.priority")) dto.priority = TaskPriority.LOW;
  if (!canSee("tasks.schedule")) {
    dto.startAt = null;
    dto.dueAt = null;
    dto.reminderAt = null;
  }

  return dto;
}

function formatLeadName(lead: Lead): string {
  return `${lead.firstName} ${lead.lastName}`.trim();
}
