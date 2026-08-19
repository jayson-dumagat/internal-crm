import { FilterIcon, PlusIcon } from "../../icons";
import type { ReactNode } from "react";

type CalendarToolbarProps = {
  canCreate: boolean;
  onAddEvent: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters?: ReactNode;
};

export default function CalendarToolbar({
  canCreate,
  onAddEvent,
  showFilters,
  onToggleFilters,
  filters,
}: CalendarToolbarProps) {
  return (
    <div className="border-b border-gray-100 px-4 py-2.5 dark:border-white/[0.05] sm:px-5">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          aria-expanded={showFilters}
          onClick={onToggleFilters}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          <FilterIcon className="size-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
        <button
          type="button"
          disabled={!canCreate}
          title={canCreate ? "Add Event" : "Read-only access"}
          onClick={onAddEvent}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          <PlusIcon className="size-4" />
          <span className="hidden sm:inline">Add Event</span>
        </button>
      </div>
      {showFilters && filters ? filters : null}
    </div>
  );
}
