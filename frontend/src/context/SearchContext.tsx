import { createContext } from "react";

export type SearchContextType = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

export const SearchContext = createContext<SearchContextType | null>(null);