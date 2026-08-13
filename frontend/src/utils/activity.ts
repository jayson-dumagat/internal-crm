import dayjs from "dayjs";
import { formatDisplayDate } from "./date";

export function formatRelativeActivityTime(timestamp: string): string {
  const date = dayjs(timestamp);
  if (!date.isValid()) return "—";

  const minutes = dayjs().diff(date, "minute");
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = dayjs().diff(date, "hour");
  if (hours < 24) return `${hours} hours ago`;
  return formatDisplayDate(timestamp);
}

export function groupByActivityDate<T extends { timestamp: string }>(
  activities: readonly T[],
): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();
  activities.forEach((activity) => {
    const key = dayjs(activity.timestamp).format("YYYY-MM-DD");
    groups.set(key, [...(groups.get(key) ?? []), activity]);
  });
  return [...groups.entries()];
}
