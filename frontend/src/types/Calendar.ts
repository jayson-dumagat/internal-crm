import type { EventInput } from "@fullcalendar/core";

export interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}