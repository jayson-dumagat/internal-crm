import type { ReactNode } from "react";
import SearchField from "../search/SearchField";
import { ExportIcon, FilterIcon } from "../../icons";

type ActivityToolbarProps = {
  showFilters: boolean;
  onToggleFilters: () => void;
  filters?: ReactNode;
  onExport: () => void;
  canExport: boolean;
};

export default function ActivityToolbar({
  showFilters,
  onToggleFilters,
  filters,
  onExport,
  canExport,
}: ActivityToolbarProps) {
  return (
    <div className="border-b border-gray-100 px-4 py-2.5 sm:pr-5 dark:border-white/[0.05]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchField />
        <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
          <button
            type="button"
            aria-expanded={showFilters}
            onClick={onToggleFilters}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <FilterIcon /> Filter
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            title={canExport ? "Export activities" : "Permission required"}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:[&_svg]:opacity-50 disabled:hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:disabled:border-gray-800 dark:disabled:bg-gray-900 dark:disabled:text-gray-600 dark:disabled:hover:bg-gray-900"
          >
            <ExportIcon /> Export
          </button>
        </div>
      </div>
      {showFilters && filters ? filters : null}
    </div>
  );
}
