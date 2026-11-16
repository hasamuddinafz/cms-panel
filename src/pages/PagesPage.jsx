import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const dt = useDataTable();
  const { queryParams } = dt;
  const navigate = useNavigate();

  const STATUS_LABELS = {
    Draft:     "Draft",
    Published: "Published",
    Archived:  "Archived",
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
    "pages"
  );

  async function handleDelete(id) {
    if (!await confirm("This content will be permanently deleted. Are you sure?")) return;
    try { await deleteInstance(id).unwrap(); toast.success("Deleted."); }
    catch { toast.error("No records found."); }
  }

  const columns = useMemo(() => [
    {
      id: "slug", header: "Slug", accessorKey: "slug",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>,
    },
    {
      id: "pageModelKey", header: "Model", accessorKey: "pageModelKey",
      cell: ({ row }) => (
        <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
          {row.original.pageModelKey ?? "—"}
        </span>
      ),
    },
    {
      id: "status", header: "Status", accessorKey: "status",
      cell: ({ row }) => {
        const s = row.original.status;
        return <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_COLORS[s] ?? ""}`}>{STATUS_LABELS[s] ?? s}</span>;
      },
    },
    {
      id: "viewCount", header: "Views", accessorKey: "viewCount",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Eye size={12} className="text-muted-foreground" />
          {(row.original.viewCount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "publishedAt", header: "Published", accessorKey: "publishedAt",
      cell: ({ row }) => row.original.publishedAt
        ? new Date(row.original.publishedAt).toLocaleDateString("en-US")
        : "—",
    },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => {
        const { id, status } = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            {canEdit && (
              <Button variant="ghost" size="icon" title="Edit"
                onClick={() => navigate(`/pages/edit/${id}`)}>
                <Pencil size={13} />
              </Button>
            )}
            {canPublish && status === "Draft" && (
              <Button variant="ghost" size="icon" title="Publish"
                onClick={async () => {
                  try { await publishPage(id).unwrap(); toast.success("Published."); }
                  catch { toast.error("No records found."); }
                }}>
                <CheckCircle size={13} className="text-green-600" />
              </Button>
            )}
            {canPublish && status === "Published" && (
              <Button variant="ghost" size="icon" title="Archive"
                onClick={async () => {
                  try { await archivePage(id).unwrap(); toast.success("Archived."); }
                  catch { toast.error("No records found."); }
                }}>
                <Archive size={13} className="text-muted-foreground" />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="icon" title="Delete"
                onClick={() => handleDelete(id)}
                className="text-destructive hover:text-destructive">
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [canEdit, canDelete, canPublish]); // eslint-disable-line

  return (
    <>
      <PanelHelmet title="Content" />
      {canCreate && (
        <div className="flex justify-end mb-4">
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/pages/new")}>
            <Plus size={14} /> New Content
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
