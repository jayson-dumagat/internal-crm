import PageMeta from "../components/common/PageMeta";
import PipelineBoard from "../components/pipelines/PipelineBoard";
import AppBreadcrumb from "../components/common/AppBreadcrumb";

export default function Pipelines() {
  return (
    <div>
      <PageMeta
        title="CDEX Pipeline | Caballes-Go Securities, Inc."
        description="Manage and track your sales pipeline."
      />
      <AppBreadcrumb pageName="Pipelines" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <PipelineBoard />
      </div>
    </div>
  );
}
