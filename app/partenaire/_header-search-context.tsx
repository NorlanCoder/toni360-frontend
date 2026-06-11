"use client";

import { createContext, useContext, useState } from "react";

interface HeaderSearchCtx {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  searchPlaceholder: string;
  setSearchPlaceholder: (p: string) => void;
}

const HeaderSearchContext = createContext<HeaderSearchCtx>({
  searchQuery: "",
  setSearchQuery: () => {},
  showSearch: false,
  setShowSearch: () => {},
  searchPlaceholder: "Rechercher...",
  setSearchPlaceholder: () => {},
});

export function HeaderSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Rechercher...");

  return (
    <HeaderSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        showSearch,
        setShowSearch,
        searchPlaceholder,
        setSearchPlaceholder,
      }}
    >
      {children}
    </HeaderSearchContext.Provider>
  );
}

export function useHeaderSearch() {
  return useContext(HeaderSearchContext);
}
