import { FilterIcon, PlusIcon } from "../../icons";
import SearchField from "../search/SearchField";
import type { ReactNode } from "react";

type NotesToolbarProps = {
  canCreate: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters?: ReactNode;
  onAdd: () => void;
};

export default function NotesToolbar({
  canCreate,
  showFilters,
  onToggleFilters,
  filters,
  onAdd,
}: NotesToolbarProps) {
  return (
    <div className="border-b border-gray-100 px-4 py-2.5 sm:px-5 dark:border-white/[0.05]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchField />
        <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
          <button
            type="button"
            title="Filter"
            aria-expanded={showFilters}
            onClick={onToggleFilters}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <FilterIcon />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            type="button"
            disabled={!canCreate}
            title={canCreate ? "Add Note" : "Read-only access"}
            onClick={onAdd}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Add Note</span>
          </button>
        </div>
      </div>
      {showFilters && filters ? filters : null}
    </div>
  );
}
