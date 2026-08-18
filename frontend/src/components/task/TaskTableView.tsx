import type { TaskRecord } from "../../api/crm";
import Badge from "../ui/badge/Badge";
import Avatar from "../ui/avatar/Avatar";
import { formatDisplayDate } from "../../utils/date";
import { PencilIcon, TrashBinIcon } from "../../icons";

const statusColor = {
  "not-started": "light",
  "in-progress": "warning",
  completed: "success",
  overdue: "error",
  blocked: "error",
} as const;

const priorityColor = {
  low: "success",
  medium: "info",
  high: "warning",
  urgent: "error",
} as const;

const statusLabel: Record<TaskRecord["status"], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
  overdue: "Overdue / Delayed",
  blocked: "Blocked",
};

export default function TaskTableView({
  tasks,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: {
  tasks: TaskRecord[];
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1160px] table-fixed border-separate border-spacing-0">
        <thead>
          <tr>
            {[
              ["w-[20%]", "Task"],
              ["w-[22%]", "Description"],
              ["w-[9%]", "Type"],
              ["w-[12%]", "Due"],
              ["w-[14%]", "Assignee"],
              ["w-[11%]", "Lead"],
              ["w-[8%]", "Priority"],
              ["w-[12%]", "Status"],
              ["w-[8%]", "Actions"],
            ].map(([width, label]) => (
              <th key={label} className={`${width} border border-gray-100 px-4 py-3 text-left text-theme-xs font-medium text-gray-700 dark:border-white/[0.05] dark:text-gray-400`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.length ? tasks.map((task) => (
            <tr key={task.id} className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.02]">
              <td className="border border-gray-100 px-4 py-4 align-top dark:border-white/[0.05]"><p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{task.title}</p></td>
              <td className="border border-gray-100 px-4 py-4 align-top dark:border-white/[0.05]"><p className="line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{task.description || "—"}</p></td>
              <td className="border border-gray-100 px-4 py-4 align-top text-xs capitalize text-gray-600 dark:border-white/[0.05] dark:text-gray-400">{task.type.replace(/_/g, " ")}</td>
              <td className="border border-gray-100 px-4 py-4 align-top text-sm text-gray-600 dark:border-white/[0.05] dark:text-gray-400">{formatDisplayDate(task.dueAt) || "—"}</td>
              <td className="border border-gray-100 px-4 py-4 align-top dark:border-white/[0.05]"><div className="flex min-w-0 items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><Avatar src={task.assignee?.avatar} alt={task.assignee?.name ?? "Unassigned"} colorKey={task.assignee?.name ?? "unassigned"} size="xsmall" /><span className="truncate">{task.assignee?.name ?? "Unassigned"}</span></div></td>
              <td className="border border-gray-100 px-4 py-4 align-top text-xs text-gray-600 dark:border-white/[0.05] dark:text-gray-400"><span className="line-clamp-2">{task.lead?.name ?? "—"}</span></td>
              <td className="border border-gray-100 px-4 py-4 align-top dark:border-white/[0.05]"><Badge color={priorityColor[task.priority]} size="sm">{task.priority}</Badge></td>
              <td className="border border-gray-100 px-4 py-4 align-top dark:border-white/[0.05]"><Badge color={statusColor[task.status]} size="sm">{statusLabel[task.status]}</Badge></td>
              <td className="border border-gray-100 px-4 py-4 align-top dark:border-white/[0.05]"><div className="flex items-center gap-2"><button type="button" disabled={!canUpdate} title={canUpdate ? `Edit ${task.title}` : "Read-only access"} onClick={() => onEdit(task)} className="inline-flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/[0.05]" aria-label={`Edit ${task.title}`}><PencilIcon className="size-4" /></button><button type="button" disabled={!canDelete} title={canDelete ? `Delete ${task.title}` : "Read-only access"} onClick={() => onDelete(task)} className="inline-flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-error-50 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-error-500/10" aria-label={`Delete ${task.title}`}><TrashBinIcon className="size-4" /></button></div></td>
            </tr>
          )) : <tr><td colSpan={9} className="border border-gray-100 px-4 py-12 text-center text-sm text-gray-500 dark:border-white/[0.05]">No tasks found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
