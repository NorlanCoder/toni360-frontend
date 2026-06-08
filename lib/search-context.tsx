"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  triggerSearch: (term: string) => void;
  searchTerm: string;
  searchVersion: number;
  focusSearchInput: () => void;
  registerSearchInput: (el: HTMLInputElement | null) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVersion, setSearchVersion] = useState(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const triggerSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchVersion((v) => v + 1);
  }, []);

  const registerSearchInput = useCallback((el: HTMLInputElement | null) => {
    searchInputRef.current = el;
  }, []);

  const focusSearchInput = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery, triggerSearch, searchTerm, searchVersion, focusSearchInput, registerSearchInput }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
