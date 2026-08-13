import dayjs from "dayjs";
import type { TaskRecord } from "../api/crm";

export const calendarPriorityColors: Record<TaskRecord["priority"], string> = {
  low: "#12b76a",
  medium: "#465fff",
  high: "#f79009",
  urgent: "#f04438",
};

export function selectionDateTime(value: string, allDay: boolean): string {
  return allDay ? `${value}T09:00` : dayjs(value).format("YYYY-MM-DDTHH:mm");
}
