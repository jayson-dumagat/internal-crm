import { useCallback, useEffect } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import Column from "./Column";
import type { KanbanTask as Task } from "../../../types/Tasks";
import type { TaskStatus } from "../../../types/Tasks";

export type TaskKanbanStatus = TaskStatus;

interface KanbanBoardProps {
  tasks?: Task[];
  onStatusChange?: (taskId: string, status: TaskKanbanStatus) => void;
  onEditTask?: (taskId: string) => void;
  onAddTask?: (status: TaskKanbanStatus) => void;
}

const columns: Array<{
  title: string;
  status: TaskKanbanStatus;
  badgeColor: "light" | "warning" | "success" | "error";
}> = [
  { title: "Not started", status: "not-started", badgeColor: "light" },
  { title: "In Progress", status: "in-progress", badgeColor: "warning" },
  { title: "Completed", status: "completed", badgeColor: "success" },
  { title: "Overdue / Delayed", status: "overdue", badgeColor: "error" },
  { title: "Blocked", status: "blocked", badgeColor: "error" },
];

export default function KanbanBoard({
  tasks = [],
  onStatusChange = () => undefined,
  onEditTask,
  onAddTask,
}: KanbanBoardProps) {
  const changeTaskStatus = useCallback(
    (taskId: string, status: string) => {
      const normalized = status === "inProgress" ? "in-progress" : status;
      if (
        normalized === "not-started" ||
        normalized === "in-progress" ||
        normalized === "completed" ||
        normalized === "overdue" ||
        normalized === "blocked"
      ) {
        onStatusChange(taskId, normalized as TaskKanbanStatus);
      }
    },
    [onStatusChange],
  );

  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => source.data.type === "task",
        onDrop({ source, location }) {
          const target = location.current.dropTargets[0];
          const sourceData = source.data as { taskId?: string; status?: string };
          const targetData = target?.data as { status?: string } | undefined;

          if (sourceData.taskId && targetData?.status && sourceData.status !== targetData.status) {
            changeTaskStatus(sourceData.taskId, targetData.status);
          }
        },
      }),
    [changeTaskStatus],
  );

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <div
        className="grid min-w-max divide-x divide-gray-200 border-t border-gray-200 dark:divide-white/[0.05] dark:border-white/[0.05]"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(320px, 1fr))` }}
      >
        {columns.map((column) => (
          <Column
            key={column.status}
            title={column.title}
            status={column.status}
            badgeColor={column.badgeColor}
            tasks={tasks.filter((task) => task.status === column.status)}
            onEditTask={onEditTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </div>
  );
}
