import { useMemo } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, CheckCircle, Archive } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { Button } from "../components/ui/button";
import {
  useGetPageInstanceListQuery,
  useDeletePageInstanceMutation,
  useChangePageStatusMutation,
} from "../features/pages/pagesApi";
import { usePermission } from "../app/usePermission";

const STATUS_LABELS = { Draft: "Taslak", Published: "Yayında", Archived: "Arşiv" };
const STATUS_COLORS = {
  Draft:     "bg-yellow-100 text-yellow-800",
  Published: "bg-green-100 text-green-800",
  Archived:  "bg-gray-100 text-gray-700",
};

export default function PagesPage() {
  const dt = useDataTable();
  const { queryParams } = dt;

  const { data, isLoading } = useGetPageInstanceListQuery({
    search:   queryParams.search,
    page:     queryParams.page,
    pageSize: queryParams.pageSize,
    sortBy:   queryParams.sortBy,
    sortDir:  queryParams.sortDir,
  });

  const [deleteInstance] = useDeletePageInstanceMutation();
  const [changeStatus]   = useChangePageStatusMutation();

  const canEdit    = usePermission("pages.edit");
  const canDelete  = usePermission("pages.delete");
  const canPublish = usePermission("pages.publish");

  const { onExportCsv, onExportExcel } = useExport(
    "/api/admin/page-instances/export",
    { search: queryParams.search },
    "sayfalar"
  );

  async function handleDelete(id) {
    if (!window.confirm("Bu içerik kalıcı olarak silinecek. Emin misiniz?")) return;
    try {
      await deleteInstance(id).unwrap();
      toast.success("Silindi.");
    } catch {
      toast.error("Silme işlemi başarısız.");
    }
  }

  async function handleStatus(id, action) {
    try {
      await changeStatus({ id, action }).unwrap();
      toast.success("Durum güncellendi.");
    } catch {
      toast.error("Durum güncellenemedi.");
    }
  }

  const columns = useMemo(
    () => [
      {
        id: "slug",
        header: "Slug",
        accessorKey: "slug",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>
        ),
      },
      {
        id: "pageModelKey",
        header: "Model",
        accessorKey: "pageModelKey",
        cell: ({ row }) => (
          <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
            {row.original.pageModelKey}
          </span>
        ),
      },
      {
        id: "status",
        header: "Durum",
        accessorKey: "status",
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_COLORS[s] ?? ""}`}>
              {STATUS_LABELS[s] ?? s}
            </span>
          );
        },
      },
      {
        id: "viewCount",
        header: "Görüntülenme",
        accessorKey: "viewCount",
        cell: ({ row }) => (
          <span className="flex items-center gap-1 text-sm">
            <Eye size={12} className="text-muted-foreground" />
            {row.original.viewCount.toLocaleString()}
          </span>
        ),
      },
      {
        id: "publishedAt",
        header: "Yayınlandı",
        accessorKey: "publishedAt",
        cell: ({ row }) =>
          row.original.publishedAt
            ? new Date(row.original.publishedAt).toLocaleDateString("tr-TR")
            : "—",
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const { id, status } = row.original;
          return (
            <div className="flex items-center gap-1 justify-end">
              {canEdit && (
                <Button variant="ghost" size="icon" title="Düzenle">
                  <Pencil size={13} />
                </Button>
              )}
              {canPublish && status === "Draft" && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Yayınla"
                  onClick={() => handleStatus(id, "Publish")}
                >
                  <CheckCircle size={13} className="text-green-600" />
                </Button>
              )}
              {canPublish && status === "Published" && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Arşivle"
                  onClick={() => handleStatus(id, "Archive")}
                >
                  <Archive size={13} className="text-muted-foreground" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Sil"
                  onClick={() => handleDelete(id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canEdit, canDelete, canPublish]
  );

  return (
    <>
      <PanelHelmet title="İçerik" />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        isLoading={isLoading}
        page={dt.page}
        setPage={dt.setPage}
        pageSize={dt.pageSize}
        setPageSize={dt.setPageSize}
        search={dt.search}
        onSearchChange={dt.setSearch}
        sortBy={dt.sortBy}
        sortDir={dt.sortDir}
        onSortChange={dt.onSortChange}
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
      />
    </>
  );
}
