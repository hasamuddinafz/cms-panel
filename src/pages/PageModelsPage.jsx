import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileJson } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { Button } from "../components/ui/button";
import { useGetPageModelListQuery, useDeletePageModelMutation } from "../features/pageModels/pageModelsApi";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { getErrorMessage } from "../lib/errors";

export default function PageModelsPage() {
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
    if (!await confirm("This model will be deleted. Are you sure?")) return;
    try { await deleteModel(id).unwrap(); toast.success("Model deleted."); }
    catch (err) { toast.error(getErrorMessage(err, "Delete failed.")); }
  }

  const columns = useMemo(() => [
    {
      id: "name", header: "Model Name", accessorKey: "name",
      cell: ({ row }) => (
        <span className="flex items-center gap-2 font-medium text-sm">
          <FileJson size={14} className="text-muted-foreground" />
          {row.original.name}
          {row.original.isSingleton && (
            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded px-1.5 py-0.5">
              {"Singleton".toUpperCase()}
            </span>
          )}
        </span>
      ),
    },
    {
      id: "key", header: "Key", accessorKey: "key",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.key}</span>,
    },
    {
      id: "description", header: "Description", accessorKey: "description", enableSorting: false,
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
  ], []); // eslint-disable-line

  return (
    <>
      <PanelHelmet title="Page Models" />

      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/page-models/new")}>
          <Plus size={14} /> New Model
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
