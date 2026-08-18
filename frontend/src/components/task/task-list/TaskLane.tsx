import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import TaskItem from "./TaskItem";
import type { ListTask as Task } from "../../../types/Tasks";

interface TaskLaneProps {
  lane: string;
  tasks: Task[];
  isDragging: boolean;
  readOnly: boolean;
  onDragStateChange: (taskId: string | null) => void;
}

const laneLabel: Record<string, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
  overdue: "Overdue / Delayed",
  blocked: "Blocked",
};
const laneColor: Record<string, string> = {
  "not-started":
    "bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80",
  "in-progress":
    "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400",
  completed:
    "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
  overdue:
    "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500",
  blocked:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400",
};

export default function TaskLane({
  lane,
  tasks,
  isDragging,
  readOnly,
  onDragStateChange,
}: TaskLaneProps) {
  const laneRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  useEffect(() => {
    if (!laneRef.current) return;
    return dropTargetForElements({
      element: laneRef.current,
      canDrop: ({ source }) => source.data.type === "task-list-item",
      getData: () => ({ type: "task-list-lane", status: lane }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [lane]);
  return (
    <section
      ref={laneRef}
      className={`rounded-xl p-3 transition-colors ${isOver ? "bg-brand-50/60 dark:bg-brand-500/[0.06]" : "bg-gray-50/60 dark:bg-white/[0.02]"}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 text-sm font-semibold text-gray-800 dark:text-white/90">
          {laneLabel[lane] ?? lane}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium ${laneColor[lane] ?? laneColor["not-started"]}`}
          >
            {tasks.length}
          </span>
        </h3>
        {isDragging && (
          <span className="text-xs text-brand-500">Drop here</span>
        )}
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            {...task}
            readOnly={readOnly}
            onDragStateChange={onDragStateChange}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 px-5 py-6 text-center dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isDragging ? "Drop tasks here" : "No tasks"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
