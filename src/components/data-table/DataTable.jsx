import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, FileDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function DataTable({
  columns,
  data = [],
  totalCount = 0,
  page = 1,
  setPage,
  pageSize = 20,
  setPageSize,
  search = "",
  onSearchChange,
  sortBy,
  sortDir,
  onSortChange,
  isLoading,
  filterSlot,
  onExportCsv,
  onExportExcel,
}) {
  const [searchDraft, setSearchDraft] = useState(search);
  const debounceRef = useRef(null);

  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchDraft(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange?.(val), 350);
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            className="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder="Search…"
            value={searchDraft}
            onChange={handleSearchInput}
          />
        </div>

        {filterSlot}

        <div className="ml-auto flex items-center gap-1.5">
          {onExportCsv && (
            <button onClick={onExportCsv}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <FileDown size={13} /> CSV
            </button>
          )}
          {onExportExcel && (
            <button onClick={onExportExcel}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <FileDown size={13} /> Excel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {table.getHeaderGroups().flatMap((hg) =>
                  hg.headers.map((header) => {
                    const col     = header.column;
                    const canSort = col.columnDef.enableSorting !== false;
                    const active  = sortBy === col.id;
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none whitespace-nowrap",
                          canSort && "cursor-pointer hover:text-foreground"
                        )}
                        onClick={() => canSort && onSortChange?.(col.id)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(col.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="opacity-60">
                              {active
                                ? sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                                : <ChevronsUpDown size={11} className="opacity-40" />}
                            </span>
                          )}
                        </span>
                      </th>
                    );
                  })
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-xs">Loading…</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-muted-foreground text-sm">
                    No records found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-xs text-muted-foreground">
          {totalCount === 0
            ? "No records."
            : <>{from}–{to} / <strong className="text-foreground">{totalCount}</strong> records</>
          }
        </p>

        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-input bg-card pl-2 pr-7 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="min-w-[4rem] text-center text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
