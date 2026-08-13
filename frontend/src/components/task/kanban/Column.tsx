import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import Badge from "../../ui/badge/Badge";
import TaskItem from "./TaskItem";
import type { KanbanTask as Task } from "../../../types/Tasks";
import type { TaskKanbanStatus } from "./KanbanBoard";

interface ColumnProps {
  title: string;
  tasks: Task[];
  status: TaskKanbanStatus;
  badgeColor: "light" | "warning" | "success" | "error";
  onEditTask?: (taskId: string) => void;
  onAddTask?: (status: TaskKanbanStatus) => void;
}

export default function Column({
  title,
  tasks,
  status,
  badgeColor,
  onEditTask,
  onAddTask,
}: ColumnProps) {
  const columnRef = useRef<HTMLElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === "task",
      getData: () => ({ type: "task-column", status }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [status]);

  return (
    <section
      ref={columnRef}
      className={[
        "min-h-[520px] min-w-[320px] px-4 py-5 transition-colors sm:px-5",
        isOver ? "bg-brand-50/50 dark:bg-brand-500/[0.04]" : "",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <Badge variant="light" color={badgeColor} size="sm">
            {tasks.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onEdit={onEditTask} />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center dark:border-gray-800">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Drop tasks here
            </p>
          </div>
        )}

        {onAddTask && (
          <button
            type="button"
            onClick={() => onAddTask(status)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-500 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-800 dark:hover:bg-brand-500/[0.06] dark:hover:text-brand-400"
          >
            <PlusIcon />
            Add task
          </button>
        )}
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
