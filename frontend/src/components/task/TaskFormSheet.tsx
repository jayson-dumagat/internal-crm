import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { CreateTaskInput, TaskRecord } from "../../api/crm";
import { taskFormSchema, type TaskFormValues } from "../../validations/crm";
import { useLeadsQuery, useUsersQuery } from "../../hooks/crm/useCrmDirectory";
import Sheet from "../ui/sheet/Sheet";

type Values = TaskFormValues;

const taskTypes: Values["type"][] = ["general", "call", "email", "meeting", "follow_up", "document", "review"];

function normalizeTaskType(value: string): Values["type"] {
  return taskTypes.includes(value as Values["type"]) ? (value as Values["type"]) : "general";
}

const inputClassName =
  "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function toInputDate(value: string | null | undefined) {
  return value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : "";
}

function defaults(
  task: TaskRecord | null,
  defaultStatus: Values["status"],
  initialStartAt?: string | null,
  initialDueAt?: string | null,
): Values {
  return task
    ? {
        title: task.title,
        description: task.description ?? "",
        type: normalizeTaskType(task.type),
        priority: task.priority,
        status: task.status,
        color: task.color ?? "#465fff",
        startAt: toInputDate(task.startAt),
        dueAt: toInputDate(task.dueAt),
        reminderAt: toInputDate(task.reminderAt),
        assigneeId: task.assignee?.id ?? "",
        leadId: task.leadId ?? "",
      }
    : {
        title: "",
        description: "",
        type: "general",
        priority: "medium",
        status: defaultStatus,
        color: "#465fff",
        startAt: toInputDate(initialStartAt),
        dueAt: toInputDate(initialDueAt),
        reminderAt: "",
        assigneeId: "",
        leadId: "",
      };
}

export default function TaskFormSheet({
  isOpen,
  task,
  defaultStatus = "not-started",
  initialStartAt,
  initialDueAt,
  mode = "task",
  readOnly = false,
  onClose,
  onSubmit,
  isPending,
}: {
  isOpen: boolean;
  task: TaskRecord | null;
  defaultStatus?: Values["status"];
  initialStartAt?: string | null;
  initialDueAt?: string | null;
  mode?: "task" | "event";
  readOnly?: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput, task?: TaskRecord) => Promise<void>;
  isPending: boolean;
}) {
  const usersQuery = useUsersQuery();
  const leadsQuery = useLeadsQuery();
  const form = useForm<Values>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaults(task, defaultStatus, initialStartAt, initialDueAt),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaults(task, defaultStatus, initialStartAt, initialDueAt));
    }
  }, [defaultStatus, form, initialDueAt, initialStartAt, isOpen, task]);

  const submit = form.handleSubmit(async (values) =>
    onSubmit(
      {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        kind: mode === "event" ? "event" : "task",
        type: values.type,
        priority: values.priority,
        status: values.status,
        color: values.color,
        startAt: values.startAt ? new Date(values.startAt).toISOString() : null,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
        reminderAt: values.reminderAt ? new Date(values.reminderAt).toISOString() : null,
        assigneeId: values.assigneeId || null,
        leadId: values.leadId || null,
      },
      task ?? undefined,
    ),
  );

  const subject = mode === "event" ? "Event" : "Task";

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? `View ${subject}` : task ? `Edit ${subject}` : `Add ${subject}`}
      description={mode === "event" ? "Schedule a relationship event and assign ownership." : "Plan follow-ups and relationship work."}
      side="right"
      className="w-full sm:max-w-2xl xl:max-w-3xl"
    >
      <form onSubmit={submit} noValidate>
        <fieldset disabled={readOnly} className="space-y-6">
        <FormSection title="Activity details" description="Describe what needs to happen and why.">
          <Field label={`${subject} title`} error={form.formState.errors.title?.message}>
            <input {...form.register("title")} maxLength={255} className={inputClassName} placeholder={mode === "event" ? "Client meeting" : "Follow up with client"} autoFocus />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" error={form.formState.errors.type?.message}>
              <select {...form.register("type")} className={inputClassName}>
                <option value="general">General</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="follow_up">Follow-up</option>
                <option value="document">Document</option>
                <option value="review">Review</option>
              </select>
            </Field>
            <Field label="Priority" error={form.formState.errors.priority?.message}>
              <select {...form.register("priority")} className={inputClassName}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>
          </div>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <textarea {...form.register("description")} maxLength={10000} rows={4} className={`${inputClassName} h-auto py-2`} placeholder="Add context, preparation notes, or next steps" />
          </Field>
        </FormSection>

        <FormSection title="Ownership and relationship" description="Assign the activity to a teammate and connect it to a lead.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assigned to" error={form.formState.errors.assigneeId?.message}>
              <select {...form.register("assigneeId")} className={inputClassName} disabled={usersQuery.isLoading}>
                <option value="">Me (default)</option>
                {(usersQuery.data ?? []).map((user) => (
                  <option key={user.id} value={user.id}>{user.isCurrentUser ? "Me" : user.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Related lead" error={form.formState.errors.leadId?.message}>
              <select {...form.register("leadId")} className={inputClassName} disabled={leadsQuery.isLoading}>
                <option value="">No lead linked</option>
                {(leadsQuery.data ?? []).map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.name}{lead.company ? ` · ${lead.company}` : ""}</option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Schedule" description="Set a start, due, and optional reminder date and time.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date and time" error={form.formState.errors.startAt?.message}>
              <input type="datetime-local" {...form.register("startAt")} className={inputClassName} />
            </Field>
            <Field label="Due date and time" error={form.formState.errors.dueAt?.message}>
              <input type="datetime-local" {...form.register("dueAt")} className={inputClassName} />
            </Field>
          </div>
          <Field label="Reminder" error={form.formState.errors.reminderAt?.message}>
            <input type="datetime-local" {...form.register("reminderAt")} className={inputClassName} />
          </Field>
        </FormSection>

        <FormSection title="Workflow and appearance" description="Control the workflow status and calendar appearance.">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Status">
              <select {...form.register("status")} className={inputClassName}>
                <option value="not-started">Not started</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue / Delayed</option>
                <option value="blocked">Blocked</option>
              </select>
            </Field>
            <Field label="Color hex" error={form.formState.errors.color?.message}>
              <input {...form.register("color")} maxLength={7} className={inputClassName} placeholder="#465fff" />
            </Field>
            <Field label="Color picker">
              <input type="color" {...form.register("color")} className="h-10 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-900" />
            </Field>
          </div>
        </FormSection>

        </fieldset>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400">Cancel</button>
          <button type="submit" disabled={isPending || readOnly} className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">{readOnly ? "View only" : isPending ? "Saving..." : task ? `Save ${subject}` : `Add ${subject}`}</button>
        </div>
      </form>
    </Sheet>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]"><div><h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p></div>{children}</section>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error-500">{error}</span>}</label>;
}
