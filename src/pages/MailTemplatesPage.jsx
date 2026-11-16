import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  useGetMailTemplatesQuery,
  useCreateMailTemplateMutation,
  useUpdateMailTemplateMutation,
  useDeleteMailTemplateMutation,
} from "../features/mail/mailApi";
import { usePermission } from "../app/usePermission";

export default function MailTemplatesPage() {
  const dt = useDataTable();
  const [editing, setEditing] = useState(null); // null = list, { id?, name, subject, htmlBody } = form

  const { data, isLoading } = useGetMailTemplatesQuery({
    search: dt.queryParams.search,
    page: dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
  });

  const [createTpl] = useCreateMailTemplateMutation();
  const [updateTpl] = useUpdateMailTemplateMutation();
  const [deleteTpl] = useDeleteMailTemplateMutation();

  const canCreate = usePermission("mailtemplates.create");
  const canEdit   = usePermission("mailtemplates.edit");
  const canDelete = usePermission("mailtemplates.delete");
  const confirm = useConfirm();

  async function handleSave() {
    if (!editing?.name?.trim() || !editing?.subject?.trim()) {
      toast.error("Name and subject are required.");
      return;
    }
    try {
      if (editing.id) {
        await updateTpl({ id: editing.id, name: editing.name, subject: editing.subject, htmlBody: editing.htmlBody }).unwrap();
        toast.success("Template updated.");
      } else {
        await createTpl({ name: editing.name, subject: editing.subject, htmlBody: editing.htmlBody }).unwrap();
        toast.success("Template created.");
      }
      setEditing(null);
    } catch {
      toast.error("An error occurred.");
    }
  }

  async function handleDelete(id) {
    if (!await confirm("Delete this template?")) return;
    try {
      await deleteTpl(id).unwrap();
      toast.success("Template deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  }

  const columns = useMemo(() => [
    {
      id: "name", header: "Template Name", accessorKey: "name",
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.name}</span>,
    },
    {
      id: "subject", header: "Subject", accessorKey: "subject",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.subject}</span>,
    },
    {
      id: "createdAt", header: "Created", accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-US"),
    },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <button
              onClick={() => setEditing({ id: row.original.id, name: row.original.name, subject: row.original.subject, htmlBody: row.original.htmlBody ?? "" })}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.original.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ], [canEdit, canDelete]); // eslint-disable-line react-hooks/exhaustive-deps

  if (editing !== null) {
    return (
      <>
        <PanelHelmet title="Mail Templates" />
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setEditing(null)}
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X size={16} />
            </button>
            <h1 className="text-xl font-bold">{editing.id ? "Edit Template" : "New Template"}</h1>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g. Welcome Mail"
                value={editing.name}
                onChange={(e) => setEditing(v => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                placeholder="Mail subject"
                value={editing.subject}
                onChange={(e) => setEditing(v => ({ ...v, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>HTML Body</Label>
              <textarea
                rows={12}
                placeholder="<p>...</p>"
                value={editing.htmlBody}
                onChange={(e) => setEditing(v => ({ ...v, htmlBody: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Save size={14} /> Save
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHelmet title="Mail Templates" />

      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button size="sm" className="gap-1.5" onClick={() => setEditing({ name: "", subject: "", htmlBody: "" })}>
            <Plus size={14} /> New Template
          </Button>
        )}
      </div>

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
      />
    </>
  );
}
