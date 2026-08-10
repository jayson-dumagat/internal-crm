import { type MouseEvent, useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import Avatar from "../../ui/avatar/Avatar";
import Badge from "../../ui/badge/Badge";
import type { Task } from "./types/types";

interface TaskItemProps {
  task: Task;
  onEdit?: (taskId: string) => void;
}

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const taskRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = taskRef.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: "task",
        taskId: task.id,
        status: task.status,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id, task.status]);

  const handleInteractiveClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <article
      ref={taskRef}
      className={[
        "group rounded-xl border border-gray-100 bg-white shadow-theme-xs transition",
        "hover:border-gray-200 hover:shadow-theme-sm",
        "dark:border-white/[0.05] dark:bg-gray-900 dark:hover:border-white/[0.08]",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab",
      ].join(" ")}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={task.assignee}
              alt={task.assigneeName || "Unassigned"}
              colorKey={task.assigneeName || task.title}
              size="medium"
            />
            <div className="min-w-0">
              <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {task.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {task.projectDesc || task.category.name}
              </p>
            </div>
          </div>

          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${task.title}`}
              title={`Edit ${task.title}`}
              onClick={(event) => {
                handleInteractiveClick(event);
                onEdit(task.id);
              }}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
            >
              <EditIcon />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="light" color="primary" size="sm">
            {task.category.name}
          </Badge>
          {task.priority && (
            <Badge variant="light" color={priorityColor(task.priority)} size="sm">
              {task.priority}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-4 py-3 dark:border-white/[0.05]">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500">Due date</p>
          <p className="mt-0.5 truncate text-xs font-medium text-gray-600 dark:text-gray-300">
            {task.dueDate || "No due date"}
          </p>
        </div>
        <span className="max-w-32 truncate text-right text-xs text-gray-500 dark:text-gray-400">
          {task.assigneeName || "Unassigned"}
        </span>
      </div>
    </article>
  );
}

function priorityColor(priority: NonNullable<Task["priority"]>) {
  if (priority === "urgent") return "error" as const;
  if (priority === "high") return "warning" as const;
  if (priority === "low") return "success" as const;
  return "info" as const;
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
      <path
        d="M14.5 5.5 18.5 9.5M6 18l2.75-.55L18 8.2a1.75 1.75 0 0 0 0-2.48l-.72-.72a1.75 1.75 0 0 0-2.48 0l-9.25 9.25L5 17v1h1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
