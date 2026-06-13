import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Generic server-side DataTable.
 *
 * Props:
 *   columns       – TanStack column defs (id, header, accessorKey/cell, enableSorting?)
 *   data          – current page rows
 *   totalCount    – total filtered rows (for pagination)
 *   page / setPage
 *   pageSize / setPageSize
 *   search / onSearchChange
 *   sortBy / sortDir / onSortChange(columnId)
 *   isLoading
 *   filters       – { [key]: value } (pass to parent via onFilterChange)
 *   filterSlot    – optional JSX rendered between search and table (for filter controls)
 *   onExportCsv   – () => void
 *   onExportExcel – () => void
 */
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

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Ara…"
            value={searchDraft}
            onChange={handleSearchInput}
          />
        </div>

        {filterSlot}

        <div className="ml-auto flex items-center gap-2">
          {onExportCsv && (
            <Button variant="outline" size="sm" onClick={onExportCsv} className="gap-1.5">
              <Download size={13} /> CSV
            </Button>
          )}
          {onExportExcel && (
            <Button variant="outline" size="sm" onClick={onExportExcel} className="gap-1.5">
              <Download size={13} /> Excel
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const col     = header.column;
                  const canSort = col.columnDef.enableSorting !== false;
                  const active  = sortBy === col.id;
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide select-none",
                        canSort && "cursor-pointer hover:text-foreground"
                      )}
                      onClick={() => canSort && onSortChange?.(col.id)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(col.columnDef.header, header.getContext())}
                        {canSort && (
                          active
                            ? sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                            : <ChevronsUpDown size={12} className="opacity-40" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground text-sm">
                  Yükleniyor…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground text-sm">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          Toplam <strong className="text-foreground">{totalCount}</strong> kayıt
        </span>

        <div className="flex items-center gap-2">
          {/* Page size picker */}
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / sayfa</option>
            ))}
          </select>

          {/* Prev / page / next */}
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹
          </Button>
          <span className="px-1 text-xs">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
