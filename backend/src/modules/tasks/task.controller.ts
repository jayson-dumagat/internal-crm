import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { recordActivity } from "../activities/activity.service";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import { Task, TaskPriority, TaskStatus, TaskType } from "./task.entity";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "./task.schema";
import { Lead } from "../leads/lead.entity";

const taskRepository = () => AppDataSource.getRepository(Task);
const userRepository = () => AppDataSource.getRepository(User);
const leadRepository = () => AppDataSource.getRepository(Lead);

async function getCurrentUser(req: Request) {
  const sessionUser = req.session.user;
  if (!sessionUser) return null;
  return userRepository().findOne({ where: { entraTenantId: sessionUser.tenantId, entraObjectId: sessionUser.entraObjectId, status: UserStatus.ACTIVE, isAccessEnabled: true } });
}

async function getAssignee(req: Request, entraObjectId?: string | null) {
  if (!entraObjectId || !req.session.user) return null;
  return userRepository().findOne({ where: { entraTenantId: req.session.user.tenantId, entraObjectId, status: UserStatus.ACTIVE, isAccessEnabled: true } });
}

async function getLead(req: Request, id?: string | null) {
  const tenantId = req.session.user?.tenantId;
  if (!tenantId || !id) return null;
  return leadRepository().findOne({ where: { id, owner: { entraTenantId: tenantId } } });
}

export async function listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const tasks = await taskRepository().find({ where: { tenantId }, relations: { assignee: true, lead: true }, order: { dueAt: "ASC", createdAt: "DESC" } });
    res.status(200).json({ data: tasks.map(toTaskDto) });
  } catch (error) { next(error); }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const currentUser = await getCurrentUser(req);
    if (!currentUser) { res.status(400).json({ success: false, message: "Your user profile is not ready yet. Please retry." }); return; }
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: "Please check the task fields and try again.", errors: parsed.error.issues }); return; }
    const assignee = parsed.data.assigneeId ? await getAssignee(req, parsed.data.assigneeId) : currentUser;
    if (parsed.data.assigneeId && !assignee) { res.status(400).json({ success: false, message: "The selected assignee was not found." }); return; }
    const lead = parsed.data.leadId ? await getLead(req, parsed.data.leadId) : null;
    if (parsed.data.leadId && !lead) { res.status(400).json({ success: false, message: "The selected lead was not found." }); return; }
    const task = taskRepository().create({
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: (parsed.data.type ?? TaskType.GENERAL) as TaskType,
      status: toTaskStatus(parsed.data.status),
      priority: (parsed.data.priority ?? TaskPriority.MEDIUM) as TaskPriority,
      color: parsed.data.color ?? null,
      startAt: toDate(parsed.data.startAt),
      dueAt: toDate(parsed.data.dueAt),
      reminderAt: toDate(parsed.data.reminderAt),
      assigneeId: assignee?.id ?? null,
      assignee: assignee ?? null,
      leadId: lead?.id ?? null,
      lead,
      organizationId: null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      tenantId: sessionUser.tenantId,
      completedAt: parsed.data.status === "completed" ? new Date() : null,
      completedById: parsed.data.status === "completed" ? currentUser.id : null,
      isReminderSent: false,
    });
    const saved = await taskRepository().save(task);
    await recordActivity({ tenantId: sessionUser.tenantId, actorId: currentUser.id, actorName: currentUser.displayName, actorAvatarUrl: currentUser.avatarUrl ? `/api/v1/users/${currentUser.entraObjectId}/avatar` : null, action: "created task", target: saved.title, category: "Task", ipAddress: req.ip });
    res.status(201).json({ data: toTaskDto(saved) });
  } catch (error) { next(error); }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const currentUser = await getCurrentUser(req);
    const task = await taskRepository().findOne({ where: { id: String(req.params.id), tenantId: sessionUser.tenantId }, relations: { assignee: true, lead: true } });
    if (!task) { res.status(404).json({ success: false, message: "Task not found." }); return; }
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: "Please check the task fields and try again.", errors: parsed.error.issues }); return; }
    Object.assign(task, {
      ...parsed.data,
      description: parsed.data.description === undefined ? task.description : parsed.data.description || null,
      type: parsed.data.type === undefined ? task.type : parsed.data.type,
      status: parsed.data.status === undefined ? task.status : toTaskStatus(parsed.data.status),
      priority: parsed.data.priority === undefined ? task.priority : parsed.data.priority,
      color: parsed.data.color === undefined ? task.color : parsed.data.color,
      startAt: parsed.data.startAt === undefined ? task.startAt : toDate(parsed.data.startAt),
      dueAt: parsed.data.dueAt === undefined ? task.dueAt : toDate(parsed.data.dueAt),
      reminderAt: parsed.data.reminderAt === undefined ? task.reminderAt : toDate(parsed.data.reminderAt),
      updatedById: currentUser?.id ?? task.updatedById,
    });
    if (parsed.data.assigneeId !== undefined) {
      const assignee = await getAssignee(req, parsed.data.assigneeId);
      if (parsed.data.assigneeId && !assignee) { res.status(400).json({ success: false, message: "The selected assignee was not found." }); return; }
      task.assigneeId = assignee?.id ?? null;
      task.assignee = assignee;
    }
    if (parsed.data.leadId !== undefined) {
      const lead = await getLead(req, parsed.data.leadId);
      if (parsed.data.leadId && !lead) { res.status(400).json({ success: false, message: "The selected lead was not found." }); return; }
      task.leadId = lead?.id ?? null;
      task.lead = lead;
    }
    if (task.status === TaskStatus.COMPLETED && !task.completedAt) { task.completedAt = new Date(); task.completedById = currentUser?.id ?? null; }
    if (task.status !== TaskStatus.COMPLETED) { task.completedAt = null; task.completedById = null; }
    const saved = await taskRepository().save(task);
    if (currentUser) await recordActivity({ tenantId: sessionUser.tenantId, actorId: currentUser.id, actorName: currentUser.displayName, actorAvatarUrl: currentUser.avatarUrl ? `/api/v1/users/${currentUser.entraObjectId}/avatar` : null, action: "updated task", target: saved.title, category: "Task", ipAddress: req.ip });
    res.status(200).json({ data: toTaskDto(saved) });
  } catch (error) { next(error); }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = updateTaskStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "A valid task status is required.", errors: parsed.error.issues });
    return;
  }
  req.body = parsed.data;
  return updateTask(req, res, next);
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) { res.status(401).json({ success: false, message: "Authentication is required." }); return; }
    const result = await taskRepository().delete({ id: String(req.params.id), tenantId });
    if (!result.affected) { res.status(404).json({ success: false, message: "Task not found." }); return; }
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
}

function toTaskDto(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    status: fromTaskStatus(task.status),
    priority: task.priority,
    color: task.color,
    startAt: task.startAt?.toISOString() ?? null,
    dueAt: task.dueAt?.toISOString() ?? null,
    reminderAt: task.reminderAt?.toISOString() ?? null,
    leadId: task.leadId,
    lead: task.lead ? { id: task.lead.id, name: `${task.lead.firstName} ${task.lead.lastName}`.trim() } : null,
    assignee: task.assignee ? { id: task.assignee.entraObjectId, name: task.assignee.displayName.replace(/\s*\(CGSI\)\s*$/i, "").trim(), avatar: task.assignee.avatarUrl ? `/api/v1/users/${task.assignee.entraObjectId}/avatar` : null } : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function toDate(value?: string | null) { return value ? new Date(value) : null; }
function toTaskStatus(value?: string): TaskStatus {
  switch (value) {
    case "in-progress": return TaskStatus.IN_PROGRESS;
    case "completed": return TaskStatus.COMPLETED;
    case "overdue": return TaskStatus.OVERDUE;
    case "blocked": return TaskStatus.BLOCKED;
    default: return TaskStatus.NOT_STARTED;
  }
}

function fromTaskStatus(value: TaskStatus): "not-started" | "in-progress" | "completed" | "overdue" | "blocked" {
  switch (value) {
    case TaskStatus.IN_PROGRESS: return "in-progress";
    case TaskStatus.COMPLETED: return "completed";
    case TaskStatus.OVERDUE: return "overdue";
    case TaskStatus.BLOCKED: return "blocked";
    default: return "not-started";
  }
}
