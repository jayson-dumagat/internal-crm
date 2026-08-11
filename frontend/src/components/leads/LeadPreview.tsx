import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";
import Sheet from "../ui/sheet/Sheet";
import LexicalNoteEditor from "../notes/LexicalNoteEditor";

import type { Lead } from "../../pages/CrmLeads/Leads";
import { CalendarAltIcon, EllipsisIcon, EmailIcon, PhoneIcon, SquarePenIcon, TaskIcon } from "../../icons";
import { formatDisplayDate } from "../../utils/date";
import { useActivitiesQuery, useCreateNote, useNotesQuery, useTasksQuery } from "../../hooks/crm/useCrmDirectory";
import type { TaskRecord } from "../../api/crm";
import { toast } from "sonner";
import { useCan } from "../../hooks/auth/useCan";

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

type LeadPreviewTab = "activity" | "notes" | "tasks" | "events";

interface LeadPreviewProps {
  lead: Lead | null;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
}

const tabs: Array<{
  id: LeadPreviewTab;
  label: string;
}> = [
  {
    id: "activity",
    label: "Activity",
  },
  {
    id: "notes",
    label: "Notes",
  },
  {
    id: "tasks",
    label: "Tasks",
  },
  {
    id: "events",
    label: "Events",
  },
];

const leadStages: Array<Lead["status"]> = [
  "New",
  "Contacted",
  "Qualified",
  "Converted",
];

const statusBadgeColor: Record<Lead["status"], BadgeColor> = {
  New: "info",
  Contacted: "light",
  Qualified: "primary",
  Converted: "success",
  Lost: "error",
};

export default function LeadPreview({
  lead,
  onClose,
  onEdit,
}: LeadPreviewProps) {
  const canUpdate = useCan("leads.update");
  const [activeTab, setActiveTab] = useState<LeadPreviewTab>("activity");

  useEffect(() => {
    setActiveTab("activity");
  }, [lead?.id]);

  return (
    <Sheet
      isOpen={!!lead}
      onClose={onClose}
      title="Lead Details"
      description="View and manage lead information."
      side="right"
      className="w-full sm:max-w-2xl xl:max-w-3xl"
    >
      {lead && (
        <div>
          <LeadSummary lead={lead} onEdit={onEdit} canUpdate={canUpdate} />

          <LeadTabs activeTab={activeTab} onChange={setActiveTab} />

          <div className="pt-5">
            {activeTab === "activity" && <ActivityTab lead={lead} />}

            {activeTab === "notes" && <NotesTab key={lead.id} lead={lead} />}

            {activeTab === "tasks" && <TasksTab lead={lead} />}

            {activeTab === "events" && <EventsTab lead={lead} />}
          </div>
        </div>
      )}
    </Sheet>
  );
}

function LeadSummary({
  lead,
  onEdit,
  canUpdate,
}: {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  canUpdate: boolean;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.05]">
      {/* Identity and quick actions */}
      <div className="flex flex-col gap-5 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={lead.avatar} alt={lead.name} size="large" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">
                {lead.name}
              </h2>

              <Badge
                variant="light"
                color={statusBadgeColor[lead.status]}
                size="sm"
              >
                {lead.status}
              </Badge>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <a
                href={`mailto:${lead.email}`}
                className="truncate transition hover:text-brand-500"
              >
                {lead.email}
              </a>

              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-gray-300 dark:bg-gray-600"
              />

              <a
                href={`tel:${normalizePhone(lead.phone)}`}
                className="whitespace-nowrap transition hover:text-brand-500"
              >
                {lead.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:flex sm:shrink-0">
          <QuickAction label="Email" href={`mailto:${lead.email}`}>
            <EmailIcon />
          </QuickAction>

          <QuickAction label="Call" href={`tel:${normalizePhone(lead.phone)}`}>
            <PhoneIcon />
          </QuickAction>

          <QuickAction label="Edit" disabled={!canUpdate} onClick={() => onEdit?.(lead)}>
            <SquarePenIcon />
          </QuickAction>

          <QuickAction label="More">
            <EllipsisIcon />
          </QuickAction>
        </div>
      </div>

      {/* Owner, company, role and revenue */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-b border-gray-100 sm:grid-cols-4 sm:divide-y-0 dark:divide-white/[0.05] dark:border-white/[0.05]">
        <SummaryField label="Lead Owner" className="py-4 pr-4">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              src={lead.owner.avatar}
              alt={lead.owner.name}
              size="small"
            />

            <span className="truncate">{lead.owner.name}</span>
          </div>
        </SummaryField>

        <SummaryField
          label="Company"
          value={lead.company}
          className="py-4 pl-4 sm:px-4"
        />

        <SummaryField
          label="Job Title / Role"
          value={lead.role}
          className="py-4 pr-4 sm:px-4"
        />

        <SummaryField
          label="Annual Revenue"
          value={lead.annualRevenue || "Not provided"}
          className="py-4 pl-4"
        />
      </div>

      {/* Source, progression and last activity */}
      <div className="grid gap-5 py-5 lg:grid-cols-[140px_minmax(0,1fr)_140px] lg:items-center">
        <SummaryField label="Lead Source" value={lead.source} />

        <div className="min-w-0">
          <LeadProgress status={lead.status} />
        </div>

        <SummaryField
          label="Last Activity"
          value={formatDisplayDate(lead.lastActivity)}
          className="lg:text-right"
          valueClassName="lg:text-right"
        />
      </div>
    </div>
  );
}

function LeadProgress({ status }: { status: Lead["status"] }) {
  if (status === "Lost") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full w-full bg-error-500" />
        </div>

        <Badge variant="light" color="error" size="sm">
          Lost
        </Badge>
      </div>
    );
  }

  const currentStageIndex = leadStages.indexOf(status);

  return (
    <div>
      <div className="flex gap-1">
        {leadStages.map((stage, index) => {
          const isActive = index <= currentStageIndex;

          return (
            <div
              key={stage}
              className={[
                "h-1.5 flex-1 rounded-full",
                isActive ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700",
              ].join(" ")}
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between gap-2">
        {leadStages.map((stage, index) => {
          const isCurrent = stage === status;
          const isComplete = index < currentStageIndex;

          return (
            <span
              key={stage}
              className={[
                "min-w-0 flex-1 truncate text-center text-xs",
                isCurrent
                  ? "font-medium text-brand-500 dark:text-brand-400"
                  : isComplete
                    ? "text-gray-600 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-500",
              ].join(" ")}
            >
              {stage}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function LeadTabs({
  activeTab,
  onChange,
}: {
  activeTab: LeadPreviewTab;
  onChange: (tab: LeadPreviewTab) => void;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.05]">
      <nav className="flex custom-scrollbar overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ActivityTab({ lead }: { lead: Lead }) {
  const activitiesQuery = useActivitiesQuery();
  const activities = (activitiesQuery.data ?? []).filter((activity) => activity.target === lead.name || activity.target === lead.company);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Activity Timeline
        </h3>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          View all activity
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="mt-4">
        {activities.length > 0 ? activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {index < activities.length - 1 && (
              <span className="absolute left-[5px] top-4 h-[calc(100%-8px)] w-px bg-gray-200 dark:bg-white/[0.08]" />
            )}

            <span className="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-white bg-brand-500 ring-1 ring-gray-200 dark:border-gray-900 dark:ring-white/[0.08]" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {activity.action}
                </p>

                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {formatDisplayDate(activity.timestamp)}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activity.details || `${activity.action} for ${activity.target}.`}
              </p>
            </div>
          </div>
        )) : <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">{activitiesQuery.isLoading ? "Loading activity..." : "No activity recorded for this lead yet."}</p>}
      </div>
    </div>
  );
}

const eventStatusLabels: Record<TaskRecord["status"], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
  overdue: "Overdue",
  blocked: "Blocked",
};

const eventStatusColors: Record<TaskRecord["status"], BadgeColor> = {
  "not-started": "light",
  "in-progress": "info",
  completed: "success",
  overdue: "warning",
  blocked: "error",
};

const taskPriorityLabels: Record<TaskRecord["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const taskPriorityColors: Record<TaskRecord["priority"], BadgeColor> = {
  low: "light",
  medium: "info",
  high: "warning",
  urgent: "error",
};

function TasksTab({ lead }: { lead: Lead }) {
  const tasksQuery = useTasksQuery();
  const tasks = (tasksQuery.data ?? [])
    .filter((task) => task.kind === "task" && task.leadId === lead.id)
    .sort((a, b) => {
      const aDate = a.dueAt ?? a.startAt ?? a.createdAt;
      const bDate = b.dueAt ?? b.startAt ?? b.createdAt;
      return dayjs(aDate).valueOf() - dayjs(bDate).valueOf();
    });

  return (
    <div>
      <TabHeader title="Tasks" />

      {tasksQuery.isLoading ? (
        <div className="mt-4 border-y border-gray-100 py-10 text-center dark:border-white/[0.05]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading tasks...</p>
        </div>
      ) : tasksQuery.isError ? (
        <div className="mt-4 border-y border-gray-100 py-10 text-center dark:border-white/[0.05]">
          <p className="text-sm text-error-500">
            {tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : "Unable to load tasks."}
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-4 border-y border-gray-100 py-10 text-center dark:border-white/[0.05]">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">No tasks</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            No tasks are currently associated with {lead.name}.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: TaskRecord }) {
  return (
    <article className="flex gap-3 rounded-xl border border-gray-100 p-3.5 dark:border-white/[0.05]">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300">
        <TaskIcon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
              {task.title}
            </h4>
            <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">
              {task.type.replace(/_/g, " ")}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Badge variant="light" color={eventStatusColors[task.status]} size="sm">
              {eventStatusLabels[task.status]}
            </Badge>
            <Badge variant="light" color={taskPriorityColors[task.priority]} size="sm">
              {taskPriorityLabels[task.priority]}
            </Badge>
          </div>
        </div>

        {task.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTaskSchedule(task)}</span>

          {task.assignee && (
            <span className="inline-flex items-center gap-1.5">
              <Avatar src={task.assignee.avatar} alt={task.assignee.name} size="xsmall" />
              <span className="max-w-40 truncate">{task.assignee.name}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function EventsTab({ lead }: { lead: Lead }) {
  const tasksQuery = useTasksQuery();
  const events = (tasksQuery.data ?? [])
    .filter(
      (task) =>
        task.kind === "event" &&
        task.leadId === lead.id &&
        task.status !== "blocked" &&
        Boolean(task.startAt || task.dueAt),
    )
    .sort((a, b) => {
      const aDate = a.startAt ?? a.dueAt ?? a.createdAt;
      const bDate = b.startAt ?? b.dueAt ?? b.createdAt;
      return dayjs(aDate).valueOf() - dayjs(bDate).valueOf();
    });

  return (
    <div>
      <TabHeader title="Events" />

      {tasksQuery.isLoading ? (
        <div className="mt-4 border-y border-gray-100 py-10 text-center dark:border-white/[0.05]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading events...</p>
        </div>
      ) : tasksQuery.isError ? (
        <div className="mt-4 border-y border-gray-100 py-10 text-center dark:border-white/[0.05]">
          <p className="text-sm text-error-500">
            {tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : "Unable to load events."}
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="mt-4 border-y border-gray-100 py-10 text-center dark:border-white/[0.05]">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">No events</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            No scheduled events are currently associated with {lead.name}.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: TaskRecord }) {
  return (
    <article className="flex gap-3 rounded-xl border border-gray-100 p-3.5 dark:border-white/[0.05]">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
        <CalendarAltIcon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
              {event.title}
            </h4>
            <p className="mt-1 text-xs capitalize text-gray-500 dark:text-gray-400">
              {event.type.replace(/_/g, " ")}
            </p>
          </div>

          <Badge
            variant="light"
            color={eventStatusColors[event.status]}
            size="sm"
          >
            {eventStatusLabels[event.status]}
          </Badge>
        </div>

        {event.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
            {event.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatEventSchedule(event)}</span>

          {event.assignee && (
            <span className="inline-flex items-center gap-1.5">
              <Avatar
                src={event.assignee.avatar}
                alt={event.assignee.name}
                size="xsmall"
              />
              <span className="max-w-40 truncate">{event.assignee.name}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function formatTaskSchedule(task: TaskRecord) {
  const start = task.startAt ? dayjs(task.startAt) : null;
  const due = task.dueAt ? dayjs(task.dueAt) : null;

  if (!start && !due) return "No date scheduled";
  if (!start) return `Due ${due?.format("DD MMMM, YYYY h:mm A")}`;
  if (!due) return `Starts ${start.format("DD MMMM, YYYY h:mm A")}`;

  if (start.isSame(due, "day")) {
    return `${start.format("DD MMMM, YYYY h:mm A")} – ${due.format("h:mm A")}`;
  }

  return `${start.format("DD MMMM, YYYY h:mm A")} – ${due.format("DD MMMM, YYYY h:mm A")}`;
}

function formatEventSchedule(event: TaskRecord) {
  const start = event.startAt ? dayjs(event.startAt) : null;
  const due = event.dueAt ? dayjs(event.dueAt) : null;

  if (!start && !due) return "No date scheduled";
  if (!start) return `Due ${due?.format("DD MMMM, YYYY h:mm A")}`;
  if (!due) return start.format("DD MMMM, YYYY h:mm A");

  if (start.isSame(due, "day")) {
    return `${start.format("DD MMMM, YYYY h:mm A")} – ${due.format("h:mm A")}`;
  }

  return `${start.format("DD MMMM, YYYY h:mm A")} – ${due.format("DD MMMM, YYYY h:mm A")}`;
}

function SummaryField({
  label,
  value,
  children,
  className = "",
  valueClassName = "",
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-1.5 text-xs text-gray-400 dark:text-gray-500">{label}</p>

      <div
        className={`min-w-0 truncate text-sm font-medium text-gray-800 dark:text-white/90 ${valueClassName}`}
      >
        {children ?? value ?? "Not provided"}
      </div>
    </div>
  );
}

function QuickAction({
  label,
  children,
  href,
  onClick,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className = [
    "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-gray-700 transition",
    "hover:bg-gray-50",
    "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]",
    disabled ? "cursor-not-allowed opacity-50" : "",
  ].join(" ");

  const content = <>{children}</>;

  if (href) {
    return (
      <a href={href} aria-label={label} title={label} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
}

function TabHeader({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>

      {actionLabel && (
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function NotesTab({ lead }: { lead: Lead }) {
  const [note, setNote] = useState("");
  const [noteHtml, setNoteHtml] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);
  const notesQuery = useNotesQuery();
  const createNote = useCreateNote();
  const previousNotes = (notesQuery.data ?? []).filter((item) => item.relatedTo === lead.name || item.relatedTo === lead.company);

  const handleSaveNote = async () => {
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      return;
    }

    try {
      await createNote.mutateAsync({
        title: `Note about ${lead.name}`,
        content: trimmedNote,
        contentHtml: noteHtml || null,
        category: "Client",
        relatedTo: lead.name,
      });
      toast.success("Note added successfully.");
      setNote("");
      setNoteHtml("");
      setEditorVersion((version) => version + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save note.");
    }
  };

  return (
    <div>
      <div className="mt-4">
        <LexicalNoteEditor
          key={`${lead.id}-${editorVersion}`}
          placeholder={`Write a note about ${lead.name}...`}
          onChange={(plainText, html) => {
            setNote(plainText);
            setNoteHtml(html);
          }}
        />

        <div className="mt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={!note.trim() || createNote.isPending}
            onClick={handleSaveNote}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createNote.isPending ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
          Previous Notes
        </p>

        {previousNotes.length > 0 ? <div className="mt-4 space-y-3">{previousNotes.map((item) => <article key={item.id} className="rounded-lg border border-gray-100 p-3 dark:border-white/[0.05]"><p className="text-sm text-gray-700 dark:text-gray-300">{item.content}</p><p className="mt-2 text-xs text-gray-400">{formatDisplayDate(item.updatedAt)} · {item.author}</p></article>)}</div> : <div className="mt-4 py-6 text-center"><p className="text-sm text-gray-500 dark:text-gray-400">{notesQuery.isLoading ? "Loading notes..." : "No notes have been added yet."}</p></div>}
      </div>
    </div>
  );
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}
