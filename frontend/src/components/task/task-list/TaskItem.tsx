import { useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Task } from "./types/Task";

interface TaskItemProps extends Task { readOnly: boolean; onDragStateChange: (taskId: string | null) => void }

export default function TaskItem({ id, title, isChecked, dueDate, commentCount, category, userAvatar, status, readOnly, onDragStateChange, toggleChecked }: TaskItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    if (!itemRef.current) return;
    return draggable({
      element: itemRef.current,
      getInitialData: () => ({ type: "task-list-item", taskId: id, status }),
      onDragStart: () => { setIsDragging(true); onDragStateChange(id); },
      onDrop: () => { setIsDragging(false); onDragStateChange(null); },
    });
  }, [id, onDragStateChange, status]);
  return <article ref={itemRef} className={`rounded-xl border border-gray-100 bg-white p-4 shadow-theme-sm transition-all duration-200 dark:border-white/[0.05] dark:bg-white/5 ${isDragging ? "scale-[0.99] opacity-40" : "hover:border-gray-200 hover:shadow-theme-xs"}`}>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex w-full items-start gap-3">
        <span className="mt-0.5 cursor-grab text-gray-400" aria-hidden="true">⠿</span>
        <label htmlFor={`taskCheckbox${id}`} className={`w-full ${readOnly ? "cursor-default" : "cursor-pointer"}`}><div className="flex items-start"><input type="checkbox" disabled={readOnly} id={`taskCheckbox${id}`} className="sr-only taskCheckbox" checked={isChecked} onChange={toggleChecked} /><span className={`mr-3 flex size-5 shrink-0 items-center justify-center rounded-md border ${isChecked ? "border-brand-500 bg-brand-500" : "border-gray-300 dark:border-gray-700"}`}><span className={isChecked ? "text-xs text-white" : "hidden"}>✓</span></span><p className={`-mt-0.5 text-sm text-gray-800 dark:text-white/90 ${isChecked ? "line-through opacity-60" : ""}`}>{title}</p></div></label>
      </div>
      <div className="flex w-full flex-col-reverse items-start justify-end gap-3 xl:flex-row xl:items-center xl:gap-5"><div className="flex items-center gap-3"><span className="text-xs text-gray-500 dark:text-gray-400">{dueDate || "No due date"}</span><span className="text-xs text-gray-400">{commentCount} comments</span></div><div className="flex items-center gap-2"><span className="rounded-full bg-brand-50 px-2 py-0.5 text-theme-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">{category || "General"}</span><img className="size-6 rounded-full object-cover" src={userAvatar} alt="Assigned user" /></div></div>
    </div>
  </article>;
}
