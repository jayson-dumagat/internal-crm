import React, { useState } from "react";
import TaskLane from "./TaskLane";
import { Task } from "./types/Task";

const lanes = ["todo", "in-progress", "completed"];

export default function TaskList({
  tasks = [],
  onStatusChange = () => undefined,
  embedded = false,
}: {
  tasks?: Task[];
  onStatusChange?: (taskId: string, status: "todo" | "in-progress" | "completed") => void;
  embedded?: boolean;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const handleDrop = (event: React.DragEvent<HTMLDivElement>, status: string) => {
    event.preventDefault();
    if (dragging && lanes.includes(status)) onStatusChange(dragging, status as "todo" | "in-progress" | "completed");
    setDragging(null);
  };

  return <div className={embedded ? "bg-white dark:bg-transparent" : "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"}>
    <div className={`space-y-8 p-4 xl:p-6 ${embedded ? "" : "mt-7 border-t border-gray-200 sm:mt-0 dark:border-gray-800"}`}>
      {lanes.map((lane) => <TaskLane key={lane} lane={lane} tasks={tasks.filter((task) => task.status === lane).map((task) => ({ ...task, toggleChecked: () => onStatusChange(task.id, task.isChecked ? "todo" : "completed") }))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, lane)} onDragStart={(_, taskId) => setDragging(taskId)} />)}
    </div>
  </div>;
}
