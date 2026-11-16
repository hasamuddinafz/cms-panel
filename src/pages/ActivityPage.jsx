import { useMemo } from "react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { useGetActivityListQuery } from "../features/activity/activityApi";

function getActionLabel(action) {
  const map = {
    Created:   "Created",
    Updated:   "Updated",
    Deleted:   "Deleted",
    Published: "Published",
    LoggedIn:  "Logged In",
  };
  return map[action] ?? action;
}

export default function ActivityPage() {
  const dt = useDataTable();

  const { data, isLoading } = useGetActivityListQuery({
    search: dt.queryParams.search,
    page: dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
    sortBy: dt.queryParams.sortBy || "createdAt",
    sortDir: dt.queryParams.sortDir || "desc",
  });

  const { onExportCsv, onExportExcel } = useExport(
    "/api/admin/activity/export",
    { search: dt.queryParams.search },
    "activity"
  );

  const columns = useMemo(() => [
    {
      id: "userEmail",
      header: "User",
      accessorKey: "userEmail",
      cell: ({ row }) => <span className="text-sm">{row.original.userEmail ?? "System"}</span>,
    },
    {
      id: "action",
      header: "Action",
      accessorKey: "action",
      cell: ({ row }) => (
        <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
          {getActionLabel(row.original.action)}
        </span>
      ),
    },
    {
      id: "entityType",
      header: "Entity",
      accessorKey: "entityType",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.entityType}</span>,
    },
    {
      id: "ipAddress",
      header: "IP",
      accessorKey: "ipAddress",
      enableSorting: false,
      cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.ipAddress ?? "—"}</span>,
    },
    {
      id: "createdAt",
      header: "Date",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString("en-US")}
        </span>
      ),
    },
  ], []); // eslint-disable-line

  return (
    <>
      <PanelHelmet title="Activity Log" />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        isLoading={isLoading}
        page={dt.page} setPage={dt.setPage}
        pageSize={dt.pageSize} setPageSize={dt.setPageSize}
        search={dt.search} onSearchChange={dt.setSearch}
        sortBy={dt.sortBy} sortDir={dt.sortDir} onSortChange={dt.onSortChange}
        onExportCsv={onExportCsv} onExportExcel={onExportExcel}
      />
    </>
  );
}
