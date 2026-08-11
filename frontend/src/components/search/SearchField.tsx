import { memo } from "react";
import { SearchIcon } from "../../icons";
import { useSearch } from "../../hooks/useSearch";

const SearchField = () => {
  const { search, setSearch } = useSearch();

  return (
    <div className="relative md:w-[280px]">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400">
        <SearchIcon />
      </span>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="h-9 w-full rounded-lg border border-gray-300 bg-transparent pr-3.5 pl-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
    </div>
  );
};

export default memo(SearchField);