import KanbanBoard from "../../components/task/kanban/KanbanBoard";
import PageMeta from "../../components/common/PageMeta";

export default function Deals() {
  return (
    <div>
      <PageMeta
        title="CDEX Pipeline | Caballes-Go Securities, Inc."
        description="This is React.js Task Kanban Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <KanbanBoard />
      </div>
    </div>
  );
}
