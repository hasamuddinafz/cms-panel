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
      toast.error("Ad ve konu alanları zorunludur.");
      return;
    }
    try {
      if (editing.id) {
        await updateTpl({ id: editing.id, name: editing.name, subject: editing.subject, htmlBody: editing.htmlBody }).unwrap();
        toast.success("Şablon güncellendi.");
      } else {
        await createTpl({ name: editing.name, subject: editing.subject, htmlBody: editing.htmlBody }).unwrap();
        toast.success("Şablon oluşturuldu.");
      }
      setEditing(null);
    } catch {
      toast.error("Bir hata oluştu.");
    }
  }

  async function handleDelete(id) {
    if (!await confirm("Bu şablon silinsin mi?")) return;
    try {
      await deleteTpl(id).unwrap();
      toast.success("Şablon silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  }

  const columns = useMemo(() => [
    {
      id: "name", header: "Şablon Adı", accessorKey: "name",
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.name}</span>,
    },
    {
      id: "subject", header: "Konu", accessorKey: "subject",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.subject}</span>,
    },
    {
      id: "createdAt", header: "Oluşturulma", accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("tr-TR"),
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
        <PanelHelmet title="Mail Şablonu" />
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setEditing(null)}
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X size={16} />
            </button>
            <h1 className="text-xl font-bold">{editing.id ? "Şablonu Düzenle" : "Yeni Şablon"}</h1>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Şablon Adı</Label>
              <Input
                placeholder="örn. Hoşgeldin Maili"
                value={editing.name}
                onChange={(e) => setEditing(v => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Konu</Label>
              <Input
                placeholder="Mail konusu"
                value={editing.subject}
                onChange={(e) => setEditing(v => ({ ...v, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>İçerik (HTML)</Label>
              <textarea
                rows={12}
                placeholder="<p>Mail içeriğini buraya yazın...</p>"
                value={editing.htmlBody}
                onChange={(e) => setEditing(v => ({ ...v, htmlBody: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditing(null)}>İptal</Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Save size={14} /> Kaydet
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHelmet title="Mail Şablonları" />

      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button size="sm" className="gap-1.5" onClick={() => setEditing({ name: "", subject: "", htmlBody: "" })}>
            <Plus size={14} /> Yeni Şablon
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
