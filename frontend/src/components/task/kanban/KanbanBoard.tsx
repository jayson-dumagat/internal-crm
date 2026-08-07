import { useCallback, useEffect } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Column from "./Column";
import { Task } from "./types/types";

export default function KanbanBoard({
  tasks = [],
  onStatusChange = () => undefined,
}: {
  tasks?: Task[];
  onStatusChange?: (taskId: string, status: "todo" | "in-progress" | "completed") => void;
}) {
  const changeTaskStatus = useCallback((taskId: string, status: string) => {
    const normalized = status === "inProgress" ? "in-progress" : status;
    if (normalized === "todo" || normalized === "in-progress" || normalized === "completed") onStatusChange(taskId, normalized);
  }, [onStatusChange]);

  useEffect(() => monitorForElements({
    canMonitor: ({ source }) => source.data.type === "task",
    onDrop({ source, location }) {
      const target = location.current.dropTargets[0];
      const sourceData = source.data as { taskId?: string };
      const targetData = target?.data as { status?: string } | undefined;
      if (sourceData.taskId && targetData?.status) changeTaskStatus(sourceData.taskId, targetData.status);
    },
  }), [changeTaskStatus]);

  return <div className="mt-7 grid grid-cols-1 divide-x divide-gray-200 border-t border-gray-200 dark:divide-white/[0.05] dark:border-white/[0.05] sm:mt-0 sm:grid-cols-2 xl:grid-cols-3">
    <Column title="To Do" tasks={tasks.filter((task) => task.status === "todo")} status="todo" />
    <Column title="In Progress" tasks={tasks.filter((task) => task.status === "inProgress")} status="inProgress" />
    <Column title="Completed" tasks={tasks.filter((task) => task.status === "completed")} status="completed" />
  </div>;
}
