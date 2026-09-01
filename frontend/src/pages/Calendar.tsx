import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
  EventDropArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import dayjs from "dayjs";

import PageMeta from "../components/common/PageMeta";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import type { TaskRecord } from "../api/crm";
import type { CreateTaskInput } from "../types/Crm";
import {
  useCreateTask,
  useTasksQuery,
  useUpdateTask,
  useDeleteTask,
  useLeadsQuery,
  useUsersQuery,
} from "../hooks/crm/useCrmDirectory";
import TaskFormSheet from "../components/task/TaskFormSheet";
import { useCan } from "../hooks/auth/useCan";
import CalendarEventContent from "../components/calendar/CalendarEventContent";
import CalendarToolbar from "../components/calendar/CalendarToolbar";
import { selectionDateTime, taskEventColor } from "../utils/calendar";
import { useToast } from "../hooks/useToast";
import { useSearchParams } from "react-router";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { DataLoadingSkeleton } from "../components/common/PageLoadingSkeleton";
import CrmFilterControls, { toFilterOptions, toIdFilterOptions } from "../components/crm/CrmFilterControls";

export default function Calendar() {
  const toast = useToast();
  const calendarRef = useRef<FullCalendar>(null);
  const tasksQuery = useTasksQuery();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const canCreate = useCan("tasks.create");
  const canUpdate = useCan("tasks.update");
  const canDelete = useCan("tasks.delete");
  const [searchParams, setSearchParams] = useSearchParams();
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const usersQuery = useUsersQuery();
  const leadsQuery = useLeadsQuery(false);
  const [showFilters, setShowFilters] = useState(false);
  const today = dayjs().startOf("day");
  const todayDate = today.format("YYYY-MM-DD");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [initialStartAt, setInitialStartAt] = useState<string | null>(null);
  const [initialDueAt, setInitialDueAt] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TaskRecord | null>(null);

  useEffect(() => {
    if (searchParams.get("kind") === "event") return;
    const next = new URLSearchParams(searchParams);
    next.set("kind", "event");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const events = useMemo<EventInput[]>(
    () =>
      tasks
        .filter(
          (task) =>
            task.kind === "event" &&
            task.status !== "blocked" &&
            (task.startAt || task.dueAt),
        )
        .map((task) => {
          const color = taskEventColor(task);
          const start = task.startAt ?? task.dueAt ?? undefined;
          const startDate = start ? dayjs(start) : null;
          let end = task.dueAt ? dayjs(task.dueAt) : null;
          // FullCalendar needs a real end to render an event's duration. A
          // missing/identical end would otherwise collapse the event to a
          // point in month view.
          if (startDate && (!end || !end.isAfter(startDate))) {
            end = startDate.add(30, "minute");
          }
          return {
            id: task.id,
            title: task.title,
            start,
            end: end?.toISOString(),
            allDay: false,
            display: "block",
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
    if (dayjs(selectInfo.start).isBefore(today, "day")) {
      selectInfo.view.calendar.unselect();
      toast.info("Past dates cannot be scheduled.");
      return;
    }
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
    if (
      (input.startAt && dayjs(input.startAt).isBefore(today)) ||
      (input.dueAt && dayjs(input.dueAt).isBefore(today))
    ) {
      toast.error("Calendar events must use today or a future date.");
      return;
    }
    try {
      if (editing) {
        await updateTask.mutateAsync({
          id: editing.id,
          input: { ...input, kind: "event" },
        });
        toast.success("Calendar event updated.");
      } else {
        await createTask.mutateAsync({
          ...input,
          kind: "event",
          type: input.type ?? "meeting",
        });
        toast.success("Calendar event added.");
      }
      closeForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save calendar event.",
      );
    }
  };

  const persistEventRange = async (
    change: EventDropArg | EventResizeDoneArg,
  ) => {
    if (
      !canUpdate ||
      !change.event.start ||
      dayjs(change.event.start).isBefore(today, "day") ||
      (change.event.end &&
        dayjs(change.event.end).isBefore(change.event.start))
    ) {
      change.revert();
      if (change.event.start && dayjs(change.event.start).isBefore(today, "day")) {
        toast.info("Past dates cannot be scheduled.");
      }
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update event schedule.",
      );
    }
  };

  return (
    <>
      <PageMeta
        title="CDEX Calendar | Caballes-Go Securities, Inc."
        description="Schedule and manage relationship activities."
      />
      <AppBreadcrumb pageName="Calendar" />
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CalendarToolbar
          canCreate={canCreate}
          onAddEvent={() => openNewEvent()}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          filters={
            <CrmFilterControls
              filters={[
                { key: "type", label: "Type", value: searchParams.get("type") ?? "", options: toFilterOptions(["call", "email", "meeting", "follow_up", "document", "review", "general"]) },
                { key: "priority", label: "Priority", value: searchParams.get("priority") ?? "", options: toFilterOptions(["low", "medium", "high", "urgent"]) },
                { key: "assignedTo", label: "Assigned to", value: searchParams.get("assignedTo") ?? "", options: toIdFilterOptions((usersQuery.data ?? []).map((user) => ({ id: user.id, name: user.isCurrentUser ? "Me" : user.name }))) },
                { key: "relatedTo", label: "Related lead", value: searchParams.get("relatedTo") ?? "", options: toIdFilterOptions((leadsQuery.data ?? []).map((lead) => ({ id: lead.id, name: lead.name }))) },
                { key: "status", label: "Status", value: searchParams.get("status") ?? "", options: toFilterOptions(["not-started", "in-progress", "completed", "overdue", "blocked"]) },
              ]}
              dateFrom={searchParams.get("dateFrom") ?? ""}
              dateTo={searchParams.get("dateTo") ?? ""}
              onChange={updateFilter}
              onDateChange={(from, to) => {
                const next = new URLSearchParams(searchParams);
                if (from) next.set("dateFrom", from); else next.delete("dateFrom");
                if (to) next.set("dateTo", to); else next.delete("dateTo");
                next.delete("page");
                setSearchParams(next);
              }}
            />
          }
        />
        {tasksQuery.isLoading && <DataLoadingSkeleton rows={5} />}
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable
            selectMirror
            nowIndicator
            validRange={{ start: todayDate }}
            selectAllow={(selection) => !dayjs(selection.start).isBefore(today, "day")}
            eventAllow={(dropInfo) => !dayjs(dropInfo.start).isBefore(today, "day")}
            editable={canUpdate}
            eventStartEditable={canUpdate}
            eventDurationEditable={canUpdate}
            dayMaxEvents={3}
            eventMaxStack={3}
            eventDisplay="block"
            forceEventDuration
            displayEventEnd
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={(change) => void persistEventRange(change)}
            eventResize={(change) => void persistEventRange(change)}
            eventContent={(eventInfo) => (
              <CalendarEventContent
                timeText={eventInfo.timeText}
                title={eventInfo.event.title}
                backgroundColor={eventInfo.event.backgroundColor}
              />
            )}
          />
        </div>
        {tasksQuery.isError && (
          <p className="border-t border-gray-100 px-5 py-3 text-sm text-error-500 dark:border-white/[0.05]">
            {tasksQuery.error.message}
          </p>
        )}
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
        canDelete={canDelete}
        onDelete={() => { if (selectedTask) setDeleteCandidate(selectedTask); }}
        isPending={createTask.isPending || updateTask.isPending}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete event?"
        description={deleteCandidate ? `This will permanently remove “${deleteCandidate.title}”.` : ""}
        isPending={deleteTask.isPending}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={async () => {
          if (!deleteCandidate) return;
          try {
            await deleteTask.mutateAsync(deleteCandidate.id);
            toast.success("Calendar event deleted.");
            setDeleteCandidate(null);
            closeForm();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to delete calendar event.");
          }
        }}
      />
    </>
  );
}
