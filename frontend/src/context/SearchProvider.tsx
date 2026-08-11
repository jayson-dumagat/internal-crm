import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { SearchContext } from "./SearchContext";

type SearchProviderProps = {
  children: ReactNode;
};

export const SearchProvider = ({
  children,
}: SearchProviderProps) => {
  const [search, setSearch] = useState("");

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