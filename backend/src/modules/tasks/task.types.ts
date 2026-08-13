import { TaskStatus } from "./task.entity";

export type SerializedTaskStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "overdue"
  | "blocked";

export function toTaskStatus(value?: string): TaskStatus {
  switch (value) {
    case "in-progress":
      return TaskStatus.IN_PROGRESS;
    case "completed":
      return TaskStatus.COMPLETED;
    case "overdue":
      return TaskStatus.OVERDUE;
    case "blocked":
      return TaskStatus.BLOCKED;
    default:
      return TaskStatus.NOT_STARTED;
  }
}

export function fromTaskStatus(value: TaskStatus): SerializedTaskStatus {
  switch (value) {
    case TaskStatus.IN_PROGRESS:
      return "in-progress";
    case TaskStatus.COMPLETED:
      return "completed";
    case TaskStatus.OVERDUE:
      return "overdue";
    case TaskStatus.BLOCKED:
      return "blocked";
    default:
      return "not-started";
  }
}
