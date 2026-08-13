import type { TaskRecord } from "../api/crm";
import type { KanbanTask, ListTask } from "../types/Tasks";
import { formatDisplayDate } from "./date";

export function filterTasks(
  tasks: readonly TaskRecord[],
  searchTerm: string,
  statusFilter: TaskRecord["status"] | "All",
): TaskRecord[] {
  const term = searchTerm.trim().toLowerCase();
  return tasks.filter((task) =>
    (statusFilter === "All" || task.status === statusFilter) &&
    (!term || [task.title, task.description, task.type, task.priority, task.status, task.assignee?.name]
      .join(" ")
      .toLowerCase()
      .includes(term)),
  );
}

export function toListTask(task: TaskRecord): ListTask {
  return {
    id: task.id,
    title: task.title,
    isChecked: task.status === "completed",
    dueDate: formatDisplayDate(task.dueAt),
    commentCount: 0,
    category: task.type,
    userAvatar: task.assignee?.avatar ?? "/images/user/owner.png",
    status: task.status,
    toggleChecked: () => undefined,
  };
}

export function toKanbanTask(task: TaskRecord): KanbanTask {
  return {
    id: task.id,
    title: task.title,
    dueDate: formatDisplayDate(task.dueAt),
    comments: 0,
    assignee: task.assignee?.avatar ?? "/images/user/owner.png",
    assigneeName: task.assignee?.name ?? "Unassigned",
    status: task.status,
    priority: task.priority,
    projectDesc: task.description ?? undefined,
    category: { name: task.type, color: "brand" },
  };
}
