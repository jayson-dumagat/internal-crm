import type { ActivityRecord } from "../api/crm";

export type ActivityCategory = ActivityRecord["category"];
export type ActivityOutcome = ActivityRecord["outcome"];
export type ActivityCategoryFilter = ActivityCategory | "All";
export type ActivityOutcomeFilter = ActivityOutcome | "All";

export const activityCategories: ActivityCategory[] = [
  "Authentication",
  "Client",
  "KYC",
  "Pipeline",
  "Task",
  "System",
];
