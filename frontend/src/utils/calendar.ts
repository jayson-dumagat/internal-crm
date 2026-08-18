import dayjs from "dayjs";
import type { TaskRecord } from "../api/crm";

export const calendarPriorityColors: Record<TaskRecord["priority"], string> = {
  low: "#7a5af8",
  medium: "#465fff",
  high: "#f79009",
  urgent: "#f04438",
};

const calendarEventPalette = ["#465fff", "#7a5af8", "#0ba5ec", "#f79009", "#f04438", "#d444f1", "#6172f3"];

/** Stable per-record color so calendar renders never change color on re-render. */
export function taskEventColor(task: Pick<TaskRecord, "id" | "title" | "priority">) {
  const seed = `${task.id}:${task.title}:${task.priority}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return calendarEventPalette[hash % calendarEventPalette.length];
}

export function selectionDateTime(value: string, allDay: boolean): string {
  return allDay ? `${value}T09:00` : dayjs(value).format("YYYY-MM-DDTHH:mm");
}
