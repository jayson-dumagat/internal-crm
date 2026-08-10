export interface Task {
  id: string;
  title: string;
  dueDate: string;
  comments?: number;
  links?: number;
  assignee: string;
  assigneeName?: string;
  status: string;
  priority?: "low" | "medium" | "high" | "urgent";
  projectDesc?: string;
  projectImg?: string;
  category: {
    name: string;
    color: string;
  };
}

export interface DropResult {
  name: string;
}
