import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { TaskRecord } from "../api/crm";
import type { CreateTaskInput } from "../types/Crm";
import {
  useCreateTask,
  useDeleteTask,
  useTasksQuery,
  useUpdateTask,
  useUpdateTaskStatus,
} from "../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import SearchField from "../components/ui/search/Search";
import TabButton from "../components/ui/tabs/TabButton";
import { FilterIcon, PlusIcon } from "../icons";
import TaskFormSheet from "../components/task/TaskFormSheet";
import TaskListPage from "../components/task/task-list/TaskListPage";
import KanbanBoard, {
  type TaskKanbanStatus,
} from "../components/task/kanban/KanbanBoard";
import TaskTableView from "../components/task/TaskTableView";
import type { KanbanTask, ListTask, TaskView } from "../types/Tasks";
import { useCan } from "../hooks/auth/useCan";
import { filterTasks, toKanbanTask, toListTask } from "../utils/tasks";
const taskViews: Array<{ id: TaskView; label: string }> = [
  { id: "list", label: "List" },
  { id: "kanban", label: "Kanban" },
  { id: "table", label: "Table" },
];

export default function Tasks() {
  const tasksQuery = useTasksQuery();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const canCreate = useCan("tasks.create");
  const canUpdate = useCan("tasks.update");
  const canDelete = useCan("tasks.delete");
  const canUpdateStatus = useCan("tasks.status.update");
  const tasks = useMemo(
    () => (tasksQuery.data ?? []).filter((task) => task.kind === "task"),
    [tasksQuery.data],
  );
  const [activeView, setActiveView] = useState<TaskView>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    TaskRecord["status"] | "All"
  >("All");
  const [showFilters, setShowFilters] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskKanbanStatus>("not-started");
  const filteredTasks = useMemo(() => filterTasks(tasks, searchTerm, statusFilter), [searchTerm, statusFilter, tasks]);
  const listTasks: ListTask[] = filteredTasks.map(toListTask);
  const kanbanTasks: KanbanTask[] = filteredTasks.map(toKanbanTask);

  const openNewTask = (status: TaskKanbanStatus = "not-started") => {
    if (!canCreate) return;
    setEditingTask(null);
    setNewTaskStatus(status);
    setIsTaskFormOpen(true);
  };

  const saveTask = async (input: CreateTaskInput, editing?: TaskRecord) => {
    if (editing && !canUpdate) return;
    if (!editing && !canCreate) return;

    try {
      if (editing) {
        await updateTask.mutateAsync({ id: editing.id, input });
        toast.success("Task updated successfully.");
      } else {
        await createTask.mutateAsync(input);
        toast.success("Task added successfully.");
      }
      setIsTaskFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save task.",
      );
    }
  };
  const changeStatus = async (
    task: TaskRecord,
    status: TaskRecord["status"],
  ) => {
    if (!canUpdateStatus) return;

    try {
      await updateTaskStatus.mutateAsync({ id: task.id, status });
      toast.success("Task status updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update task status.",
      );
    }
  };
  const removeTask = async (task: TaskRecord) => {
    if (!canDelete) return;
    if (!window.confirm(`Delete ${task.title}?`)) return;
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success("Task deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete task.",
      );
    }
  };

  return (
    <>
      <PageMeta
        title="CDEX Tasks"
        description="Client relationship tasks, follow-ups, and workflow boards for CDEX."
      />
      <AppBreadcrumb pageName="Tasks" />
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-2.5 sm:pr-5 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]">
          <SearchField
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search tasks..."
            containerClassName="min-w-0 flex-1 md:w-[280px] md:flex-none"
            className="!h-9 !py-2 !pr-3.5 !pl-10"
          />
          <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
            <button
              type="button"
              title="Filter"
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <FilterIcon />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              type="button"
              disabled={!canCreate}
              title={canCreate ? "Add Task" : "Read-only access"}
              onClick={() => openNewTask()}
                              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <PlusIcon className="size-5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as TaskRecord["status"] | "All",
                )
              }
              className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="All">All statuses</option>
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue / Delayed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        )}
        <div className="bg-gray-50/60 px-4 sm:px-5 dark:bg-white/[0.02]">
          <nav className="-mb-px flex gap-2 overflow-x-auto">
            {taskViews.map((view) => (
              <TabButton
                key={view.id}
                label={view.label}
                isActive={activeView === view.id}
                onClick={() => setActiveView(view.id)}
              />
            ))}
          </nav>
        </div>
        {tasksQuery.isLoading && (
          <p className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-white/[0.05]">
            Loading tasks...
          </p>
        )}
        {tasksQuery.isError && (
          <p className="border-t border-gray-100 px-4 py-3 text-sm text-error-500 dark:border-white/[0.05]">
            {tasksQuery.error.message}
          </p>
        )}
        <div className="border-t border-gray-100 dark:border-white/[0.05]">
          {activeView === "list" && (
            <TaskListPage
              embedded
              tasks={listTasks}
              onStatusChange={canUpdateStatus ? (id, status) => {
                const task = tasks.find((item) => item.id === id);
                if (task) void changeStatus(task, status);
              } : undefined}
            />
          )}
          {activeView === "kanban" && (
            <KanbanBoard
              tasks={kanbanTasks}
              onStatusChange={canUpdateStatus ? (id, status) => {
                const task = tasks.find((item) => item.id === id);
                if (task) void changeStatus(task, status);
              } : undefined}
              onEditTask={canUpdate ? (id) => {
                const task = tasks.find((item) => item.id === id);
                if (task) {
                  setEditingTask(task);
                  setIsTaskFormOpen(true);
                }
              } : undefined}
              onAddTask={canCreate ? openNewTask : undefined}
            />
          )}
          {activeView === "table" && (
            <TaskTableView
              tasks={filteredTasks}
              onEdit={(task) => {
                setEditingTask(task);
                setIsTaskFormOpen(true);
              }}
              onDelete={removeTask}
              onStatusChange={changeStatus}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canUpdateStatus={canUpdateStatus}
            />
          )}
        </div>
      </div>
      <TaskFormSheet
        isOpen={isTaskFormOpen}
        task={editingTask}
        defaultStatus={newTaskStatus}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={saveTask}
        isPending={createTask.isPending || updateTask.isPending}
      />
    </>
  );
}
