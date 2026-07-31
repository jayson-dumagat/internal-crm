import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import TaskListPage from "../../components/task/task-list/TaskListPage";
import TabButton from "../../components/ui/tabs/TabButton";
import DataTableTwo from "../../components/tables/DataTables/TableTwo/DataTableTwo";
import KanbanBoard from "../../components/task/kanban/KanbanBoard";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import SearchField from "../../components/ui/search/Search";
import { FilterIcon, PlusIcon } from "../../icons";

type TaskView = "list" | "kanban" | "table";

const taskViews: {
  id: TaskView;
  label: string;
}[] = [
  {
    id: "list",
    label: "List",
  },
  {
    id: "kanban",
    label: "Kanban",
  },
  {
    id: "table",
    label: "Table",
  }
];

export default function Tasks() {
  const [activeView, setActiveView] = useState<TaskView>("list");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <PageMeta
        title="CDEX Tasks"
        description="Client relationship tasks, follow-ups, and workflow boards for DEX."
      />

      <AppBreadcrumb pageName="Tasks" />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:p-5 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]">
          <SearchField
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search tasks..."
            containerClassName="w-full md:w-72"
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition hover:bg-gray-50 sm:h-11 sm:w-auto sm:gap-2 sm:px-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
            >
              <FilterIcon />
              <span className="hidden text-sm font-medium sm:inline">
                Filter
              </span>
            </button>

            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-500 text-white shadow-theme-xs transition hover:bg-brand-600 sm:h-11 sm:w-auto sm:gap-2 sm:px-4"
            >
              <PlusIcon className="size-5" />
              <span className="hidden text-sm font-medium sm:inline">
                Add Task
              </span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50/60 px-4 sm:px-5 dark:bg-white/[0.02]">
          <nav className="-mb-px flex gap-3 overflow-x-auto">
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

        <div className="border-t border-gray-200 dark:border-gray-800">
          {activeView === "list" && <TaskListPage embedded />}
          {activeView === "kanban" && <KanbanBoard />}
          {activeView === "table" && <DataTableTwo embedded />}
        </div>
      </div>
    </>
  );
}
