export interface Task {
  id: string;
  title: string;
  isChecked: boolean;
  dueDate: string;
  commentCount: number;
  category?: string;
  userAvatar: string;
  status: "not-started" | "in-progress" | "completed" | "overdue" | "blocked";
  toggleChecked: () => void;
}
