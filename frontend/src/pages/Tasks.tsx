import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import type { TaskRecord } from "../api/crm";
import type { CreateTaskInput } from "../types/Crm";
import {
  useCreateTask,
  useDeleteTask,
  useTasksQuery,
  useUpdateTask,
  useUpdateTaskStatus,
  useLeadsQuery,
  useUsersQuery,
} from "../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import SearchField from "../components/search/SearchField";
import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../hooks/useSearch";
import { useToast } from "../hooks/useToast";
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
import ConfirmDialog from "../components/common/ConfirmDialog";
import { DataLoadingSkeleton } from "../components/common/PageLoadingSkeleton";
import CrmFilterControls, { toFilterOptions, toIdFilterOptions } from "../components/crm/CrmFilterControls";
const taskViews: Array<{ id: TaskView; label: string }> = [
  { id: "list", label: "List" },
  { id: "kanban", label: "Kanban" },
  { id: "table", label: "Table" },
];

export default function Tasks() {
  const toast = useToast();
  const tasksQuery = useTasksQuery();
  const usersQuery = useUsersQuery();
  const leadsQuery = useLeadsQuery(false);
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
  const { search } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<TaskRecord["status"] | "All">((searchParams.get("status") as TaskRecord["status"] | "All") || "All");
  const [showFilters, setShowFilters] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [newTaskStatus, setNewTaskStatus] =
    useState<TaskKanbanStatus>("not-started");
  const [deleteCandidate, setDeleteCandidate] = useState<TaskRecord | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  useEffect(() => {
    if (searchParams.get("kind") === "task") return;
    const next = new URLSearchParams(searchParams);
    next.set("kind", "task");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
    if (key === "status") setStatusFilter((value || "All") as TaskRecord["status"] | "All");
  };
  const filteredTasks = useMemo(
    () => filterTasks(tasks, debouncedSearch, statusFilter),
    [debouncedSearch, statusFilter, tasks],
  );
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
        description="Client relationship tasks, follow-ups, and workflow boards."
      />
      <AppBreadcrumb pageName="Tasks" />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-2.5 sm:pr-5 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]">
          <SearchField/>
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
            <CrmFilterControls
              filters={[
                { key: "type", label: "Type", value: searchParams.get("type") ?? "", options: toFilterOptions(["general", "call", "email", "meeting", "follow_up", "document", "review"]) },
                { key: "priority", label: "Priority", value: searchParams.get("priority") ?? "", options: toFilterOptions(["low", "medium", "high", "urgent"]) },
                { key: "assignedTo", label: "Assigned to", value: searchParams.get("assignedTo") ?? "", options: toIdFilterOptions((usersQuery.data ?? []).map((user) => ({ id: user.id, name: user.isCurrentUser ? "Me" : user.name }))) },
                { key: "relatedTo", label: "Related lead", value: searchParams.get("relatedTo") ?? "", options: toIdFilterOptions((leadsQuery.data ?? []).map((lead) => ({ id: lead.id, name: lead.name }))) },
                { key: "status", label: "Status", value: searchParams.get("status") ?? "", options: toFilterOptions(["not-started", "in-progress", "completed", "overdue", "blocked"]) },
              ]}
              dateFrom={searchParams.get("dateFrom") ?? ""}
              dateTo={searchParams.get("dateTo") ?? ""}
              onChange={updateFilter}
              onDateChange={(from, to) => {
                const next = new URLSearchParams(searchParams);
                if (from) next.set("dateFrom", from); else next.delete("dateFrom");
                if (to) next.set("dateTo", to); else next.delete("dateTo");
                setSearchParams(next);
              }}
            />
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
          <div className="border-t border-gray-100 text-sm text-gray-500 dark:border-white/[0.05]">
            <DataLoadingSkeleton rows={5} />
          </div>
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
              onStatusChange={
                canUpdateStatus
                  ? (id, status) => {
                      const task = tasks.find((item) => item.id === id);
                      if (task) void changeStatus(task, status);
                    }
                  : undefined
              }
            />
          )}
          {activeView === "kanban" && (
            <KanbanBoard
              tasks={kanbanTasks}
              onStatusChange={
                canUpdateStatus
                  ? (id, status) => {
                      const task = tasks.find((item) => item.id === id);
                      if (task) void changeStatus(task, status);
                    }
                  : undefined
              }
              onEditTask={
                canUpdate
                  ? (id) => {
                      const task = tasks.find((item) => item.id === id);
                      if (task) {
                        setEditingTask(task);
                        setIsTaskFormOpen(true);
                      }
                    }
                  : undefined
              }
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
              onDelete={(task) => setDeleteCandidate(task)}
              canUpdate={canUpdate}
              canDelete={canDelete}
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
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete task?"
        description={deleteCandidate ? `This will permanently remove “${deleteCandidate.title}”.` : ""}
        isPending={deleteTask.isPending}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={async () => {
          if (!deleteCandidate) return;
          await removeTask(deleteCandidate);
          setDeleteCandidate(null);
        }}
      />
    </>
  );
}
