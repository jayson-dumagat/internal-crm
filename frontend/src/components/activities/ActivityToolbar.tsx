import type { ActivityCategory, ActivityCategoryFilter, ActivityOutcomeFilter } from "../../types/Activities";
import SearchField from "../search/SearchField";
import { ExportIcon, FilterIcon } from "../../icons";

type ActivityToolbarProps = {
  category: ActivityCategoryFilter;
  outcome: ActivityOutcomeFilter;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCategoryChange: (value: ActivityCategoryFilter) => void;
  onOutcomeChange: (value: ActivityOutcomeFilter) => void;
  onExport: () => void;
  categories: readonly ActivityCategory[];
};

export default function ActivityToolbar({
  category,
  outcome,
  showFilters,
  onToggleFilters,
  onCategoryChange,
  onOutcomeChange,
  onExport,
  categories,
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
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <ExportIcon /> Export
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-white/[0.05]">
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as ActivityCategoryFilter)}
            className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="All">All categories</option>
            {categories.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select
            value={outcome}
            onChange={(event) => onOutcomeChange(event.target.value as ActivityOutcomeFilter)}
            className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="All">All outcomes</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Denied</option>
          </select>
        </div>
      )}
    </div>
  );
}
