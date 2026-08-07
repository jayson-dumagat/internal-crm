import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayjs from "dayjs";
import { toast } from "sonner";

import type { CreateTaskInput, TaskRecord } from "../../api/crm";
import { useCreateTask, useDeleteTask, useTasksQuery, useUpdateTask } from "../../hooks/crm/useCrmDirectory";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";

type CalendarEvent = EventInput & { extendedProps: { calendar: string } };
const calendarsEvents = { Danger: "danger", Success: "success", Primary: "primary", Warning: "warning" };

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const tasksQuery = useTasksQuery();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const tasks = tasksQuery.data ?? [];
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const events = useMemo<CalendarEvent[]>(() => tasks.filter((task) => task.status !== "cancelled" && (task.startAt || task.dueAt)).map((task) => ({ id: task.id, title: task.title, start: task.startAt ?? task.dueAt ?? undefined, end: task.dueAt ?? undefined, extendedProps: { calendar: priorityToCalendar(task.priority) } })), [tasks]);

  const resetModalFields = () => { setEventTitle(""); setEventStartDate(""); setEventEndDate(""); setEventLevel("Primary"); setSelectedTask(null); };
  const handleDateSelect = (selectInfo: DateSelectArg) => { resetModalFields(); setEventStartDate(toDateInput(selectInfo.startStr)); setEventEndDate(toDateInput(selectInfo.endStr || selectInfo.startStr)); openModal(); };
  const handleEventClick = (clickInfo: EventClickArg) => { const task = tasks.find((item) => item.id === clickInfo.event.id); if (!task) return; setSelectedTask(task); setEventTitle(task.title); setEventStartDate(toDateInput(task.startAt ?? task.dueAt)); setEventEndDate(toDateInput(task.dueAt ?? task.startAt)); setEventLevel(priorityToCalendar(task.priority)); openModal(); };
  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim() || !eventStartDate) { toast.error("Add a title and start date first."); return; }
    const input: CreateTaskInput = { title: eventTitle.trim(), type: "meeting", priority: calendarToPriority(eventLevel), status: selectedTask?.status ?? "todo", startAt: new Date(`${eventStartDate}T09:00:00`).toISOString(), dueAt: eventEndDate ? new Date(`${eventEndDate}T17:00:00`).toISOString() : null };
    try { if (selectedTask) { await updateTask.mutateAsync({ id: selectedTask.id, input }); toast.success("Calendar task updated."); } else { await createTask.mutateAsync(input); toast.success("Calendar task added."); } closeModal(); resetModalFields(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save calendar task."); }
  };
  const handleDeleteEvent = async () => { if (!selectedTask) return; if (!window.confirm(`Delete ${selectedTask.title}?`)) return; try { await deleteTask.mutateAsync(selectedTask.id); toast.success("Calendar task deleted."); closeModal(); resetModalFields(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete calendar task."); } };

  return <><PageMeta title="CDEX Calendar" description="Schedule and manage relationship activities." /><AppBreadcrumb pageName="Calendar" /><div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"><div className="custom-calendar"><FullCalendar ref={calendarRef} plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: "prev,next addEventButton", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }} events={events} selectable select={handleDateSelect} eventClick={handleEventClick} eventContent={renderEventContent} customButtons={{ addEventButton: { text: "Add Event +", click: () => { resetModalFields(); openModal(); } } }} /></div>{tasksQuery.isLoading && <p className="border-t border-gray-100 px-5 py-3 text-sm text-gray-500 dark:border-white/[0.05]">Loading calendar tasks...</p>}{tasksQuery.isError && <p className="border-t border-gray-100 px-5 py-3 text-sm text-error-500 dark:border-white/[0.05]">{tasksQuery.error.message}</p>}<Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10"><div className="flex flex-col overflow-y-auto px-2 custom-scrollbar"><h5 className="mb-2 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">{selectedTask ? "Edit Event" : "Add Event"}</h5><p className="text-sm text-gray-500 dark:text-gray-400">Schedule a task on the relationship calendar.</p><div className="mt-8 space-y-6"><Field label="Event Title"><input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} className={inputClassName} /></Field><Field label="Event Color"><div className="flex flex-wrap gap-4">{Object.keys(calendarsEvents).map((key) => <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400"><input type="radio" name="event-level" value={key} checked={eventLevel === key} onChange={() => setEventLevel(key)} />{key}</label>)}</div></Field><Field label="Enter Start Date"><input type="date" value={eventStartDate} onChange={(event) => setEventStartDate(event.target.value)} className={inputClassName} /></Field><Field label="Enter End Date"><input type="date" value={eventEndDate} onChange={(event) => setEventEndDate(event.target.value)} className={inputClassName} /></Field></div><div className="mt-6 flex flex-wrap items-center justify-end gap-3"><button onClick={closeModal} type="button" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400">Close</button>{selectedTask && <button onClick={handleDeleteEvent} type="button" className="rounded-lg border border-error-200 px-4 py-2.5 text-sm font-medium text-error-500">Delete</button>}<button onClick={handleAddOrUpdateEvent} type="button" disabled={createTask.isPending || updateTask.isPending} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{createTask.isPending || updateTask.isPending ? "Saving..." : selectedTask ? "Update Changes" : "Add Event"}</button></div></div></Modal></div></>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{label}</span>{children}</label>; }
const inputClassName = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
function toDateInput(value: string | null | undefined) { return value ? dayjs(value).format("YYYY-MM-DD") : ""; }
function priorityToCalendar(priority: TaskRecord["priority"]) { return priority === "urgent" ? "Danger" : priority === "high" ? "Warning" : priority === "low" ? "Success" : "Primary"; }
function calendarToPriority(color: string): TaskRecord["priority"] { return color === "Danger" ? "urgent" : color === "Warning" ? "high" : color === "Success" ? "low" : "medium"; }
function renderEventContent(eventInfo: any) { const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`; return <div className={`event-fc-color flex fc-event-main ${colorClass} rounded-sm p-1`}><div className="fc-daygrid-event-dot" /><div className="fc-event-time">{eventInfo.timeText}</div><div className="fc-event-title">{eventInfo.event.title}</div></div>; }
