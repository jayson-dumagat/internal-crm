import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { CreateTaskInput, TaskRecord } from "../../api/crm";
import { useCreateTask, useDeleteTask, useTasksQuery, useUpdateTask, useUpdateTaskStatus } from "../../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import SearchField from "../../components/ui/search/Search";
import TabButton from "../../components/ui/tabs/TabButton";
import { FilterIcon, PlusIcon } from "../../icons";
import TaskFormSheet from "../../components/task/TaskFormSheet";
import TaskListPage from "../../components/task/task-list/TaskListPage";
import KanbanBoard from "../../components/task/kanban/KanbanBoard";
import TaskTableView from "../../components/task/TaskTableView";
import { formatDisplayDate } from "../../utils/date";
import type { Task as ListTask } from "../../components/task/task-list/types/Task";
import type { Task as KanbanTask } from "../../components/task/kanban/types/types";

type TaskView = "list" | "kanban" | "table";
const taskViews: Array<{ id: TaskView; label: string }> = [{ id: "list", label: "List" }, { id: "kanban", label: "Kanban" }, { id: "table", label: "Table" }];

export default function Tasks() {
  const tasksQuery = useTasksQuery();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const tasks = tasksQuery.data ?? [];
  const [activeView, setActiveView] = useState<TaskView>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskRecord["status"] | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const filteredTasks = useMemo(() => tasks.filter((task) => (statusFilter === "All" || task.status === statusFilter) && (!searchTerm.trim() || [task.title, task.description, task.type, task.priority, task.status, task.assignee?.name].join(" ").toLowerCase().includes(searchTerm.trim().toLowerCase()))), [searchTerm, statusFilter, tasks]);
  const listTasks: ListTask[] = filteredTasks.filter((task) => task.status !== "cancelled").map((task) => ({ id: task.id, title: task.title, isChecked: task.status === "completed", dueDate: formatDisplayDate(task.dueAt), commentCount: 0, category: task.type, userAvatar: task.assignee?.avatar ?? "/images/user/owner.png", status: task.status, toggleChecked: () => undefined }));
  const kanbanTasks: KanbanTask[] = filteredTasks.filter((task) => task.status !== "cancelled").map((task) => ({ id: task.id, title: task.title, dueDate: formatDisplayDate(task.dueAt), comments: 0, assignee: task.assignee?.avatar ?? "/images/user/owner.png", status: task.status === "in-progress" ? "inProgress" : task.status, category: { name: task.type, color: "brand" } }));

  const saveTask = async (input: CreateTaskInput, editing?: TaskRecord) => {
    try { if (editing) { await updateTask.mutateAsync({ id: editing.id, input }); toast.success("Task updated successfully."); } else { await createTask.mutateAsync(input); toast.success("Task added successfully."); } setIsTaskFormOpen(false); setEditingTask(null); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save task."); }
  };
  const changeStatus = async (task: TaskRecord, status: TaskRecord["status"]) => {
    try { await updateTaskStatus.mutateAsync({ id: task.id, status }); toast.success("Task status updated."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update task status."); }
  };
  const removeTask = async (task: TaskRecord) => {
    if (!window.confirm(`Delete ${task.title}?`)) return;
    try { await deleteTask.mutateAsync(task.id); toast.success("Task deleted successfully."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete task."); }
  };

  return <>
    <PageMeta title="CDEX Tasks" description="Client relationship tasks, follow-ups, and workflow boards for CDEX." />
    <AppBreadcrumb pageName="Tasks" />
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:p-5 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]"><SearchField value={searchTerm} onValueChange={setSearchTerm} placeholder="Search tasks..." containerClassName="w-full md:w-72" /><div className="flex items-center gap-2 sm:gap-3"><button type="button" onClick={() => setShowFilters((value) => !value)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"><FilterIcon /><span className="hidden sm:inline">Filter</span></button><button type="button" onClick={() => { setEditingTask(null); setIsTaskFormOpen(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"><PlusIcon className="size-5" /><span className="hidden sm:inline">Add Task</span></button></div></div>
      {showFilters && <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskRecord["status"] | "All")} className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="All">All statuses</option><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>}
      <div className="bg-gray-50/60 px-4 sm:px-5 dark:bg-white/[0.02]"><nav className="-mb-px flex gap-3 overflow-x-auto">{taskViews.map((view) => <TabButton key={view.id} label={view.label} isActive={activeView === view.id} onClick={() => setActiveView(view.id)} />)}</nav></div>
      {tasksQuery.isLoading && <p className="border-t border-gray-200 px-5 py-3 text-sm text-gray-500 dark:border-gray-800">Loading tasks...</p>}
      {tasksQuery.isError && <p className="border-t border-gray-200 px-5 py-3 text-sm text-error-500 dark:border-gray-800">{tasksQuery.error.message}</p>}
      <div className="border-t border-gray-200 dark:border-gray-800">{activeView === "list" && <TaskListPage embedded tasks={listTasks} onStatusChange={(id, status) => { const task = tasks.find((item) => item.id === id); if (task) void changeStatus(task, status); }} />}{activeView === "kanban" && <KanbanBoard tasks={kanbanTasks} onStatusChange={(id, status) => { const task = tasks.find((item) => item.id === id); if (task) void changeStatus(task, status); }} />}{activeView === "table" && <TaskTableView tasks={filteredTasks} onEdit={(task) => { setEditingTask(task); setIsTaskFormOpen(true); }} onDelete={removeTask} onStatusChange={changeStatus} />}</div>
    </div>
    <TaskFormSheet isOpen={isTaskFormOpen} task={editingTask} onClose={() => { setIsTaskFormOpen(false); setEditingTask(null); }} onSubmit={saveTask} isPending={createTask.isPending || updateTask.isPending} />
  </>;
}
