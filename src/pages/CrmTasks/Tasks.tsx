import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import TaskListPage from "../../components/task/task-list/TaskListPage";
import TabButton from "../../components/ui/tabs/TabButton";
import DataTableTwo from "../../components/tables/DataTables/TableTwo/DataTableTwo";
import KanbanBoard from "../../components/task/kanban/KanbanBoard";

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

  return (
    <>
      <PageMeta
        title="CCRMS Tasks"
        description="Client relationship tasks, follow-ups, and workflow boards for CCRMS."
      />

      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-2 overflow-x-auto">
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

        {activeView === "list" && <TaskListPage />}
        {activeView === "kanban" && <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"><KanbanBoard /></div>}
        {activeView === "table" && <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"><DataTableTwo /></div>}
      </div>
    </>
  );
}