import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, CheckCircle, Archive, Plus } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { Button } from "../components/ui/button";
import {
  useGetPageInstanceListQuery,
  useDeletePageInstanceMutation,
  usePublishPageMutation,
  useArchivePageMutation,
} from "../features/pages/pagesApi";
import { usePermission } from "../app/usePermission";
import { useConfirm } from "../components/ui/ConfirmDialog";

const STATUS_COLORS = {
  Draft:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Archived:  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function PagesPage() {
  const { t } = useTranslation();
  const dt = useDataTable();
  const { queryParams } = dt;
  const navigate = useNavigate();

  const STATUS_LABELS = {
    Draft:     t("pages.draft"),
    Published: t("pages.published"),
    Archived:  t("pages.archived"),
  };

  const { data, isLoading } = useGetPageInstanceListQuery({
    search:   queryParams.search,
    page:     queryParams.page,
    pageSize: queryParams.pageSize,
    sortBy:   queryParams.sortBy,
    sortDir:  queryParams.sortDir,
  });

  const [deleteInstance] = useDeletePageInstanceMutation();
  const [publishPage]    = usePublishPageMutation();
  const [archivePage]    = useArchivePageMutation();

  const canCreate  = usePermission("pages.create");
  const canEdit    = usePermission("pages.edit");
  const canDelete  = usePermission("pages.delete");
  const canPublish = usePermission("pages.publish");
  const confirm = useConfirm();

  const { onExportCsv, onExportExcel } = useExport(
    "/api/admin/pages/export",
    { search: queryParams.search },
    "sayfalar"
  );

  async function handleDelete(id) {
    if (!await confirm(t("confirm.deleteContent"))) return;
    try { await deleteInstance(id).unwrap(); toast.success(t("common.delete") + "."); }
    catch { toast.error(t("common.noData")); }
  }

  const columns = useMemo(() => [
    {
      id: "slug", header: t("pages.slug"), accessorKey: "slug",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>,
    },
    {
      id: "pageModelKey", header: t("pages.model"), accessorKey: "pageModelKey",
      cell: ({ row }) => (
        <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
          {row.original.pageModelKey ?? "—"}
        </span>
      ),
    },
    {
      id: "status", header: t("pages.status"), accessorKey: "status",
      cell: ({ row }) => {
        const s = row.original.status;
        return <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_COLORS[s] ?? ""}`}>{STATUS_LABELS[s] ?? s}</span>;
      },
    },
    {
      id: "viewCount", header: t("pages.views"), accessorKey: "viewCount",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Eye size={12} className="text-muted-foreground" />
          {(row.original.viewCount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "publishedAt", header: t("pages.publishedAt"), accessorKey: "publishedAt",
      cell: ({ row }) => row.original.publishedAt
        ? new Date(row.original.publishedAt).toLocaleDateString("tr-TR")
        : "—",
    },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => {
        const { id, status } = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            {canEdit && (
              <Button variant="ghost" size="icon" title={t("common.edit")}
                onClick={() => navigate(`/pages/edit/${id}`)}>
                <Pencil size={13} />
              </Button>
            )}
            {canPublish && status === "Draft" && (
              <Button variant="ghost" size="icon" title={t("pages.publish")}
                onClick={async () => {
                  try { await publishPage(id).unwrap(); toast.success(t("pages.publish") + "."); }
                  catch { toast.error(t("common.noData")); }
                }}>
                <CheckCircle size={13} className="text-green-600" />
              </Button>
            )}
            {canPublish && status === "Published" && (
              <Button variant="ghost" size="icon" title={t("pages.archive")}
                onClick={async () => {
                  try { await archivePage(id).unwrap(); toast.success(t("pages.archive") + "."); }
                  catch { toast.error(t("common.noData")); }
                }}>
                <Archive size={13} className="text-muted-foreground" />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="icon" title={t("common.delete")}
                onClick={() => handleDelete(id)}
                className="text-destructive hover:text-destructive">
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [canEdit, canDelete, canPublish, t]); // eslint-disable-line

  return (
    <>
      <PanelHelmet title={t("pages.title")} />
      {canCreate && (
        <div className="flex justify-end mb-4">
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/pages/new")}>
            <Plus size={14} /> {t("pages.new")}
          </Button>
        </div>
      )}
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
