import { z } from "zod";

const taskFields = {
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).optional().nullable(),
  type: z.enum(["general", "call", "email", "meeting", "follow_up", "document", "review"]).optional(),
  status: z.enum(["todo", "in-progress", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  startAt: z.string().datetime().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
  reminderAt: z.string().datetime().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
};

export const createTaskSchema = z.object(taskFields);
export const updateTaskSchema = createTaskSchema.partial();
export const updateTaskStatusSchema = z.object({ status: z.enum(["todo", "in-progress", "completed", "cancelled"]) });
