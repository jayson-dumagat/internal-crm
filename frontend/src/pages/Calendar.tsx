import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { toast } from "sonner";

import PageMeta from "../components/common/PageMeta";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import { PlusIcon } from "../icons";
import type { CreateTaskInput, TaskRecord } from "../api/crm";
import { useCreateTask, useTasksQuery, useUpdateTask } from "../hooks/crm/useCrmDirectory";
import TaskFormSheet from "../components/task/TaskFormSheet";
import { useCan } from "../hooks/auth/useCan";

const priorityColors: Record<TaskRecord["priority"], string> = {
  low: "#12b76a",
  medium: "#465fff",
  high: "#f79009",
  urgent: "#f04438",
};

function selectionDateTime(value: string, allDay: boolean) {
  return allDay ? `${value}T09:00` : dayjs(value).format("YYYY-MM-DDTHH:mm");
}

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const tasksQuery = useTasksQuery();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const canCreate = useCan("tasks.create");
  const canUpdate = useCan("tasks.update");
  const tasks = tasksQuery.data ?? [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [initialStartAt, setInitialStartAt] = useState<string | null>(null);
  const [initialDueAt, setInitialDueAt] = useState<string | null>(null);

  const events = useMemo<EventInput[]>(
    () => tasks
      .filter((task) => task.kind === "event" && task.status !== "blocked" && (task.startAt || task.dueAt))
      .map((task) => {
        const color = task.color ?? priorityColors[task.priority];
        return {
          id: task.id,
          title: task.title,
          start: task.startAt ?? task.dueAt ?? undefined,
          end: task.dueAt ?? undefined,
          allDay: false,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { calendar: task.priority, lead: task.lead?.name },
        };
      }),
    [tasks],
  );

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
    setInitialStartAt(null);
    setInitialDueAt(null);
  };

  const openNewEvent = (startAt?: string | null, dueAt?: string | null) => {
    if (!canCreate) return;
    setSelectedTask(null);
    setInitialStartAt(startAt ?? null);
    setInitialDueAt(dueAt ?? null);
    setIsFormOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectionDateTime(selectInfo.startStr, selectInfo.allDay);
    const end = selectInfo.endStr
      ? selectInfo.allDay
        ? `${dayjs(selectInfo.endStr).subtract(1, "day").format("YYYY-MM-DD")}T17:00`
        : selectionDateTime(selectInfo.endStr, false)
      : start;
    openNewEvent(start, end);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const task = tasks.find((item) => item.id === clickInfo.event.id);
    if (!task) return;
    setSelectedTask(task);
    setInitialStartAt(null);
    setInitialDueAt(null);
    setIsFormOpen(true);
  };

  const saveEvent = async (input: CreateTaskInput, editing?: TaskRecord) => {
    if (editing && !canUpdate) return;
    if (!editing && !canCreate) return;
    try {
      if (editing) {
        await updateTask.mutateAsync({ id: editing.id, input: { ...input, kind: "event" } });
        toast.success("Calendar event updated.");
      } else {
        await createTask.mutateAsync({ ...input, kind: "event", type: input.type ?? "meeting" });
        toast.success("Calendar event added.");
      }
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save calendar event.");
    }
  };

  const persistEventRange = async (change: EventDropArg | EventResizeDoneArg) => {
    if (!canUpdate || !change.event.start) {
      change.revert();
      return;
    }
    try {
      await updateTask.mutateAsync({
        id: change.event.id,
        input: {
          startAt: change.event.start.toISOString(),
          dueAt: change.event.end?.toISOString() ?? null,
        },
      });
      toast.success("Event schedule updated.");
    } catch (error) {
      change.revert();
      toast.error(error instanceof Error ? error.message : "Unable to update event schedule.");
    }
  };

  return (
    <>
      <PageMeta title="CDEX Calendar | Caballes-Go Securities, Inc." description="Schedule and manage relationship activities." />
      <AppBreadcrumb pageName="Calendar" />
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-end border-b border-gray-100 px-4 py-2.5 dark:border-white/[0.05] sm:px-5">
          <button
            type="button"
            disabled={!canCreate}
            title={canCreate ? "Add Event" : "Read-only access"}
            onClick={() => openNewEvent()}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
            events={events}
            selectable
            selectMirror
            nowIndicator
            editable={canUpdate}
            eventStartEditable={canUpdate}
            eventDurationEditable={canUpdate}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={(change) => void persistEventRange(change)}
            eventResize={(change) => void persistEventRange(change)}
            eventContent={renderEventContent}
          />
        </div>
        {tasksQuery.isError && <p className="border-t border-gray-100 px-5 py-3 text-sm text-error-500 dark:border-white/[0.05]">{tasksQuery.error.message}</p>}
      </section>
      <TaskFormSheet
        isOpen={isFormOpen}
        task={selectedTask}
        mode="event"
        readOnly={Boolean(selectedTask) && !canUpdate}
        initialStartAt={initialStartAt}
        initialDueAt={initialDueAt}
        onClose={closeForm}
        onSubmit={saveEvent}
        isPending={createTask.isPending || updateTask.isPending}
      />
    </>
  );
}

function renderEventContent(eventInfo: { timeText: string; event: { title: string; backgroundColor?: string } }) {
  const color = eventInfo.event.backgroundColor ?? "#465fff";
  return (
    <div className="flex min-w-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs text-white" style={{ backgroundColor: color }}>
      {eventInfo.timeText && <span className="shrink-0 font-medium">{eventInfo.timeText}</span>}
      <span className="truncate">{eventInfo.event.title}</span>
    </div>
  );
}
