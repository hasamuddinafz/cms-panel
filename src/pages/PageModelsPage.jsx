import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileJson } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { Button } from "../components/ui/button";
import { useGetPageModelListQuery, useDeletePageModelMutation } from "../features/pageModels/pageModelsApi";
import { useConfirm } from "../components/ui/ConfirmDialog";

export default function PageModelsPage() {
  const { t } = useTranslation();
  const dt = useDataTable();
  const navigate = useNavigate();

  const { data, isLoading } = useGetPageModelListQuery({
    search:   dt.queryParams.search,
    page:     dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
  });

  const [deleteModel] = useDeletePageModelMutation();
  const confirm = useConfirm();

  async function handleDelete(id) {
    if (!await confirm(t("confirm.deleteModel"))) return;
    try { await deleteModel(id).unwrap(); toast.success(t("rolesExtra.deleted")); }
    catch { toast.error(t("rolesExtra.deleteError")); }
  }

  const columns = useMemo(() => [
    {
      id: "name", header: t("pageModels.name"), accessorKey: "name",
      cell: ({ row }) => (
        <span className="flex items-center gap-2 font-medium text-sm">
          <FileJson size={14} className="text-muted-foreground" />
          {row.original.name}
          {row.original.isSingleton && (
            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded px-1.5 py-0.5">
              {t("pageModels.singleton").toUpperCase()}
            </span>
          )}
        </span>
      ),
    },
    {
      id: "key", header: t("pageModels.key"), accessorKey: "key",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.key}</span>,
    },
    {
      id: "description", header: t("pageModels.description"), accessorKey: "description", enableSorting: false,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description ?? "—"}</span>,
    },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/page-models/edit/${row.original.id}`)}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
            onClick={() => handleDelete(row.original.id)}>
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ], [t]); // eslint-disable-line

  return (
    <>
      <PanelHelmet title={t("pageModels.title")} />

      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/page-models/new")}>
          <Plus size={14} /> {t("pageModels.new")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        isLoading={isLoading}
        page={dt.page} setPage={dt.setPage}
        pageSize={dt.pageSize} setPageSize={dt.setPageSize}
        search={dt.search} onSearchChange={dt.setSearch}
        sortBy={dt.sortBy} sortDir={dt.sortDir} onSortChange={dt.onSortChange}
      />
    </>
  );
}
