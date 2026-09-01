import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { TaskRecord } from "../../api/crm";
import type { CreateTaskInput } from "../../types/Crm";
import { taskFormSchema, type TaskFormValues } from "../../validations/crm";
import { useLeadsQuery, useUsersQuery } from "../../hooks/crm/useCrmDirectory";
import Sheet from "../ui/sheet/Sheet";
import LexicalNoteEditor from "../notes/LexicalNoteEditor";
import ArkCombobox, { type ArkComboboxOption } from "../crm/ArkCombobox";
import ArkDatePickerField from "../crm/ArkDatePickerField";
import {
  CrmInfoSection as FormSection,
  CrmFormField as Field,
  crmInputClassName as inputClassName,
  crmPrimaryButtonClassName as primaryButtonClassName,
  crmSecondaryButtonClassName as secondaryButtonClassName,
} from "../crm/FormPrimitives";

type Values = TaskFormValues;

const taskTypes: Values["type"][] = ["general", "call", "email", "meeting", "follow_up", "document", "review"];
const typeOptions: ArkComboboxOption[] = [
  { value: "general", label: "General" }, { value: "call", label: "Call" }, { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" }, { value: "follow_up", label: "Follow-up" }, { value: "document", label: "Document" }, { value: "review", label: "Review" },
];
const priorityOptions: ArkComboboxOption[] = [
  { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" },
];
const statusOptions: ArkComboboxOption[] = [
  { value: "not-started", label: "Not started" }, { value: "in-progress", label: "In progress" }, { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue / Delayed" }, { value: "blocked", label: "Blocked" },
];

function normalizeTaskType(value: string): Values["type"] {
  return taskTypes.includes(value as Values["type"]) ? (value as Values["type"]) : "general";
}
function toInputDate(value: string | null | undefined) { return value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : ""; }
function toDatePart(value: string | null | undefined) { return value ? dayjs(value).format("YYYY-MM-DD") : ""; }
function toTimePart(value: string | null | undefined) { return value ? dayjs(value).format("HH:mm") : "09:00"; }
function combineDateTime(date: string, time: string) { return date && time ? `${date}T${time}` : ""; }
function descriptionHtml(value: string) {
  if (!value) return null;
  const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<p>${escaped.replace(/\n/g, "<br />")}</p>`;
}

function defaults(task: TaskRecord | null, defaultStatus: Values["status"], initialStartAt?: string | null, initialDueAt?: string | null): Values {
  const startAt = task?.startAt ?? initialStartAt;
  const dueAt = task?.dueAt ?? initialDueAt;
  return task ? {
    title: task.title, description: task.description ?? "", type: normalizeTaskType(task.type), priority: task.priority, status: task.status,
    color: task.color ?? "#465fff", startAt: toInputDate(startAt), dueAt: toInputDate(dueAt), reminderAt: toInputDate(task.reminderAt),
    startDate: toDatePart(startAt), endDate: toDatePart(dueAt), startTime: toTimePart(startAt), endTime: toTimePart(dueAt), reminderDate: toDatePart(task.reminderAt),
    assigneeId: task.assignee?.id ?? "", leadId: task.leadId ?? "",
  } : {
    title: "", description: "", type: "general", priority: "medium", status: defaultStatus, color: "#465fff",
    startAt: toInputDate(initialStartAt), dueAt: toInputDate(initialDueAt), reminderAt: "", startDate: toDatePart(initialStartAt), endDate: toDatePart(initialDueAt),
    startTime: toTimePart(initialStartAt), endTime: toTimePart(initialDueAt), reminderDate: "", assigneeId: "", leadId: "",
  };
}

export default function TaskFormSheet({ isOpen, task, defaultStatus = "not-started", initialStartAt, initialDueAt, mode = "task", readOnly = false, canDelete, onDelete, onClose, onSubmit, isPending }: {
  isOpen: boolean; task: TaskRecord | null; defaultStatus?: Values["status"]; initialStartAt?: string | null; initialDueAt?: string | null; mode?: "task" | "event"; readOnly?: boolean;
  canDelete?: boolean; onDelete?: () => void; onClose: () => void; onSubmit: (input: CreateTaskInput, task?: TaskRecord) => Promise<void>; isPending: boolean;
}) {
  const usersQuery = useUsersQuery();
  const leadsQuery = useLeadsQuery();
  const form = useForm<Values>({ resolver: zodResolver(taskFormSchema), defaultValues: defaults(task, defaultStatus, initialStartAt, initialDueAt) });
  const startDate = form.watch("startDate") ?? ""; const endDate = form.watch("endDate") ?? ""; const startTime = form.watch("startTime") ?? "09:00"; const endTime = form.watch("endTime") ?? "09:00"; const description = form.watch("description") ?? "";
  const minimumScheduleDate = mode === "event" ? dayjs().format("YYYY-MM-DD") : "2000-01-01";

  useEffect(() => { if (isOpen) form.reset(defaults(task, defaultStatus, initialStartAt, initialDueAt)); }, [defaultStatus, form, initialDueAt, initialStartAt, isOpen, task]);
  const updateDateRange = (start: string, end?: string) => {
    if (mode === "event" && start && dayjs(start).isBefore(dayjs(), "day")) {
      form.setError("startAt", { type: "validate", message: "Events cannot be scheduled in the past." });
      return;
    }
    if (mode === "event" && end && dayjs(end).isBefore(dayjs(), "day")) {
      form.setError("dueAt", { type: "validate", message: "Events cannot be scheduled in the past." });
      return;
    }
    const selectedEnd = end && end !== start ? end : "";
    form.setValue("startDate", start, { shouldValidate: true, shouldDirty: true });
    form.setValue("endDate", selectedEnd, { shouldValidate: true, shouldDirty: true });
    form.setValue("startAt", combineDateTime(start, startTime), { shouldValidate: true });
    form.setValue("dueAt", combineDateTime(selectedEnd || start, endTime), { shouldValidate: true });
  };
  const updateReminderDate = (date: string) => {
    if (mode === "event" && date && dayjs(date).isBefore(dayjs(), "day")) {
      form.setError("reminderAt", { type: "validate", message: "Reminders cannot be scheduled in the past." });
      return;
    }
    form.setValue("reminderDate", date, { shouldValidate: true, shouldDirty: true });
    form.setValue("reminderAt", combineDateTime(date, "09:00"), { shouldValidate: true });
  };
  const submit = form.handleSubmit(async (values) => onSubmit({
    title: values.title.trim(), description: values.description?.trim() || null, kind: mode === "event" ? "event" : "task", type: values.type, priority: values.priority, status: values.status, color: values.color,
    startAt: values.startDate && values.startTime ? new Date(combineDateTime(values.startDate, values.startTime)).toISOString() : null,
    dueAt: (values.endDate || values.startDate) && values.endTime ? new Date(combineDateTime(values.endDate || values.startDate || "", values.endTime)).toISOString() : null,
    reminderAt: values.reminderDate ? new Date(combineDateTime(values.reminderDate, "09:00")).toISOString() : null, assigneeId: values.assigneeId || null, leadId: values.leadId || null,
  }, task ?? undefined));
  const subject = mode === "event" ? "Event" : "Task";
  const users: ArkComboboxOption[] = [{ value: "", label: "Me (default)" }, ...(usersQuery.data ?? []).map((user) => ({ value: user.id, label: user.isCurrentUser ? "Me" : user.name }))];
  const leads: ArkComboboxOption[] = [{ value: "", label: "No lead linked" }, ...(leadsQuery.data ?? []).map((lead) => ({ value: lead.id, label: `${lead.name}${lead.company ? ` · ${lead.company}` : ""}` }))];

  return <Sheet isOpen={isOpen} onClose={onClose} title={readOnly ? `View ${subject}` : task ? `Edit ${subject}` : `Add ${subject}`} description={mode === "event" ? "Schedule a relationship event and assign ownership." : "Plan follow-ups and relationship work."} side="right" className="w-full sm:max-w-2xl xl:max-w-3xl">
    <form onSubmit={submit} noValidate>
      <fieldset disabled={readOnly} className="space-y-6">
        <FormSection title="Activity details" description="Describe what needs to happen and why.">
          <Field label={`${subject} title`} required error={form.formState.errors.title?.message}><input {...form.register("title")} minLength={1} maxLength={255} className={inputClassName} placeholder={mode === "event" ? "Client meeting" : "Follow up with client"} autoFocus /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" required error={form.formState.errors.type?.message}><input type="hidden" {...form.register("type")} /><ArkCombobox value={form.watch("type")} options={typeOptions} onChange={(value) => form.setValue("type", normalizeTaskType(value), { shouldValidate: true, shouldDirty: true })} placeholder="Search type" /></Field>
            <Field label="Priority" required error={form.formState.errors.priority?.message}><input type="hidden" {...form.register("priority")} /><ArkCombobox value={form.watch("priority")} options={priorityOptions} onChange={(value) => form.setValue("priority", value as Values["priority"], { shouldValidate: true, shouldDirty: true })} placeholder="Search priority" /></Field>
          </div>
          <Field label="Description" error={form.formState.errors.description?.message}><div className="relative"><LexicalNoteEditor key={task?.id ?? "new-task"} readOnly={readOnly} initialContentHtml={descriptionHtml(task?.description ?? "")} placeholder="Add context, preparation notes, or next steps" onChange={(plainText) => form.setValue("description", plainText.slice(0, 10000), { shouldValidate: true, shouldDirty: true })} /><span className="pointer-events-none absolute bottom-2 right-2 rounded bg-gray-100/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800/90 dark:text-gray-400">{description.length}/10,000</span></div></Field>
        </FormSection>
        <FormSection title="Ownership and relationship" description="Assign the activity to a teammate and connect it to a lead.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assigned to" error={form.formState.errors.assigneeId?.message}><input type="hidden" {...form.register("assigneeId")} /><ArkCombobox value={form.watch("assigneeId") ?? ""} options={users} onChange={(value) => form.setValue("assigneeId", value, { shouldValidate: true, shouldDirty: true })} placeholder={usersQuery.isLoading ? "Loading users..." : "Search users"} disabled={usersQuery.isLoading} /></Field>
            <Field label="Related lead" error={form.formState.errors.leadId?.message}><input type="hidden" {...form.register("leadId")} /><ArkCombobox value={form.watch("leadId") ?? ""} options={leads} onChange={(value) => form.setValue("leadId", value, { shouldValidate: true, shouldDirty: true })} placeholder={leadsQuery.isLoading ? "Loading leads..." : "Search leads"} disabled={leadsQuery.isLoading} /></Field>
          </div>
        </FormSection>
        <FormSection title="Schedule" description="Set a date range, time range, and optional reminder.">
          <Field label="Date range" error={form.formState.errors.startAt?.message ?? form.formState.errors.dueAt?.message}><ArkDatePickerField startValue={startDate} endValue={endDate} range min={minimumScheduleDate} max="2100-12-31" onChange={updateDateRange} placeholder="Start date" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time"><input type="time" min="00:00" max="23:59" {...form.register("startTime", { onChange: (event) => form.setValue("startAt", combineDateTime(startDate, event.target.value), { shouldValidate: true }) })} className={inputClassName} /></Field>
            <Field label="End time"><input type="time" min="00:00" max="23:59" {...form.register("endTime", { onChange: (event) => form.setValue("dueAt", combineDateTime(endDate || startDate, event.target.value), { shouldValidate: true }) })} className={inputClassName} /></Field>
          </div>
          <Field label="Reminder" error={form.formState.errors.reminderAt?.message}><ArkDatePickerField startValue={form.watch("reminderDate") ?? ""} min={minimumScheduleDate} max="2100-12-31" onChange={(date) => updateReminderDate(date)} placeholder="Reminder date" /></Field>
        </FormSection>
        <FormSection title="Workflow" description="Set the current status. Calendar colors are assigned automatically.">
          <Field label="Status" required error={form.formState.errors.status?.message}><input type="hidden" {...form.register("status")} /><ArkCombobox value={form.watch("status")} options={statusOptions} onChange={(value) => form.setValue("status", value as Values["status"], { shouldValidate: true, shouldDirty: true })} placeholder="Search status" /></Field>
        </FormSection>
      </fieldset>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">{task && onDelete && <button type="button" onClick={onDelete} disabled={!canDelete || isPending || readOnly} className="mr-auto h-10 rounded-lg border border-error-200 px-4 text-sm font-medium text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-error-500/30 dark:hover:bg-error-500/10">Delete</button>}<button type="button" onClick={onClose} className={secondaryButtonClassName}>Cancel</button><button type="submit" disabled={isPending || readOnly} className={primaryButtonClassName}>{readOnly ? "View only" : isPending ? "Saving..." : task ? `Save ${subject}` : `Add ${subject}`}</button></div>
    </form>
  </Sheet>;
}
