import { useState, useCallback } from "react";

/**
 * Encapsulates all server-side DataTable state.
 * Returns state + setters that you pass to <DataTable> and to your RTK Query hook.
 */
export function useDataTable({ defaultPageSize = 20 } = {}) {
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(defaultPageSize);
  const [sortBy,    setSortBy]    = useState("");
  const [sortDir,   setSortDir]   = useState("asc");
  const [filters,   setFilters]   = useState({});

  const handleSortChange = useCallback((columnId) => {
    if (sortBy === columnId) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnId);
      setSortDir("asc");
    }
    setPage(1);
  }, [sortBy]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  return {
    // query params — spread directly into your RTK Query args
    queryParams: { search, page, pageSize, sortBy, sortDir, filters },
    // individual setters for DataTable props
    search, setSearch: handleSearchChange,
    page,   setPage,
    pageSize, setPageSize,
    sortBy, sortDir, onSortChange: handleSortChange,
    filters, onFilterChange: handleFilterChange,
  };
}
