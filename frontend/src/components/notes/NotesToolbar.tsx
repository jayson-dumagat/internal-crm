import type { NoteRecord } from "../../api/crm";
import { FilterIcon, PlusIcon } from "../../icons";
import SearchField from "../search/SearchField";

type NotesToolbarProps = {
  category: NoteRecord["category"] | "All";
  canCreate: boolean;
  onCategoryChange: (value: NoteRecord["category"] | "All") => void;
  onAdd: () => void;
};

export default function NotesToolbar({
  category,
  canCreate,
  onCategoryChange,
  onAdd,
}: NotesToolbarProps) {
  return (
    <div className="border-b border-gray-100 px-4 py-2.5 sm:px-5 dark:border-white/[0.05]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchField />
        <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
          <div className="relative hidden min-w-0 flex-1 sm:flex-none">
            <FilterIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
            <select
              value={category}
              onChange={(event) =>
                onCategoryChange(
                  event.target.value as NoteRecord["category"] | "All",
                )
              }
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <option value="All">All categories</option>
              <option>Client</option>
              <option>Follow-up</option>
              <option>Investment</option>
              <option>Internal</option>
            </select>
          </div>
          <button
            type="button"
            title="Filter"
            onClick={() => {}}
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
    </div>
  );
}
