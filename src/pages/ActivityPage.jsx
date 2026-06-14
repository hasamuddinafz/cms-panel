import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { useGetActivityListQuery } from "../features/activity/activityApi";

function getActionLabel(action, t) {
  const map = {
    Created:   t("activity.actionLabels.Created"),
    Updated:   t("activity.actionLabels.Updated"),
    Deleted:   t("activity.actionLabels.Deleted"),
    Published: t("activity.actionLabels.Published"),
    LoggedIn:  t("activity.actionLabels.LoggedIn"),
  };
  return map[action] ?? action;
}

export default function ActivityPage() {
  const { t } = useTranslation();
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
    "aktivite"
  );

  const columns = useMemo(() => [
    {
      id: "userEmail",
      header: t("activity.user"),
      accessorKey: "userEmail",
      cell: ({ row }) => <span className="text-sm">{row.original.userEmail ?? "Sistem"}</span>,
    },
    {
      id: "action",
      header: t("activity.action"),
      accessorKey: "action",
      cell: ({ row }) => (
        <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
          {getActionLabel(row.original.action, t)}
        </span>
      ),
    },
    {
      id: "entityType",
      header: t("activity.entity"),
      accessorKey: "entityType",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.entityType}</span>,
    },
    {
      id: "ipAddress",
      header: t("activity.ip"),
      accessorKey: "ipAddress",
      enableSorting: false,
      cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.ipAddress ?? "—"}</span>,
    },
    {
      id: "createdAt",
      header: t("activity.date"),
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString("tr-TR")}
        </span>
      ),
    },
  ], [t]); // eslint-disable-line

  return (
    <>
      <PanelHelmet title={t("activity.title")} />
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
