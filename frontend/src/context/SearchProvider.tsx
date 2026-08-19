import { useMemo, useState, type ReactNode } from "react";

import { SearchContext } from "./SearchContext";

type SearchProviderProps = {
  children: ReactNode;
};

export const SearchProvider = ({
  children,
}: SearchProviderProps) => {
  const [search, setSearchState] = useState(() => new URLSearchParams(window.location.search).get("search") ?? "");
  const setSearch: React.Dispatch<React.SetStateAction<string>> = (value) => {
    setSearchState(value);
  };

  const value = useMemo(
    () => ({
      search,
      setSearch,
    }),
    [search]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
