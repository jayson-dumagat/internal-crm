import { useEffect, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import TaskLane from "./TaskLane";
import type { ListTask as Task } from "../../../types/Tasks";
import type { TaskStatus } from "../../../types/Tasks";

const lanes: TaskStatus[] = ["not-started", "in-progress", "completed", "overdue", "blocked"];

export default function TaskList({
  tasks = [],
  onStatusChange,
  embedded = false,
}: {
  tasks?: Task[];
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  embedded?: boolean;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const updateStatus = onStatusChange ?? (() => undefined);

  useEffect(() => monitorForElements({
    canMonitor: ({ source }) => source.data.type === "task-list-item",
    onDrop: ({ source, location }) => {
      const target = location.current.dropTargets[0];
      const sourceData = source.data as { taskId?: string; status?: string };
      const targetData = target?.data as { status?: string } | undefined;
      if (sourceData.taskId && targetData?.status && sourceData.status !== targetData.status && lanes.includes(targetData.status as TaskStatus)) {
        updateStatus(sourceData.taskId, targetData.status as TaskStatus);
      }
      setDragging(null);
    },
  }), [updateStatus]);

  return (
    <div className={embedded ? "bg-white dark:bg-transparent" : "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"}>
      <div className={`space-y-8 p-4 xl:p-5 ${embedded ? "" : "mt-7 border-t border-gray-200 sm:mt-0 dark:border-gray-800"}`}>
        {lanes.map((lane) => (
          <TaskLane
            key={lane}
            lane={lane}
            tasks={tasks.filter((task) => task.status === lane).map((task) => ({ ...task, toggleChecked: () => updateStatus(task.id, task.isChecked ? "not-started" : "completed") }))}
            isDragging={Boolean(dragging)}
            readOnly={!onStatusChange}
            onDragStateChange={setDragging}
          />
        ))}
      </div>
    </div>
  );
}
