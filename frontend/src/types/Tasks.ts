export type TaskView = "list" | "kanban" | "table";
export type { TaskStatus } from "./Crm";
import type { TaskStatus } from "./Crm";

export interface ListTask {
  id: string;
  title: string;
  isChecked: boolean;
  dueDate: string;
  commentCount: number;
  category?: string;
  userAvatar: string;
  status: TaskStatus;
  toggleChecked: () => void;
}

export interface KanbanTask {
  id: string;
  title: string;
  dueDate: string;
  comments?: number;
  links?: number;
  assignee: string;
  assigneeName?: string;
  status: TaskStatus;
  priority?: "low" | "medium" | "high" | "urgent";
  projectDesc?: string;
  projectImg?: string;
  category: { name: string; color: string };
}

export interface TaskDropResult {
  name: string;
}
