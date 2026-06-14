import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
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
      toast.error(t("mailTemplates.required"));
      return;
    }
    try {
      if (editing.id) {
        await updateTpl({ id: editing.id, name: editing.name, subject: editing.subject, htmlBody: editing.htmlBody }).unwrap();
        toast.success(t("mailTemplates.updated"));
      } else {
        await createTpl({ name: editing.name, subject: editing.subject, htmlBody: editing.htmlBody }).unwrap();
        toast.success(t("mailTemplates.created"));
      }
      setEditing(null);
    } catch {
      toast.error(t("mailTemplates.error"));
    }
  }

  async function handleDelete(id) {
    if (!await confirm(t("mailTemplates.deleteConfirm"))) return;
    try {
      await deleteTpl(id).unwrap();
      toast.success(t("mailTemplates.deleted"));
    } catch {
      toast.error(t("mailTemplates.deleteError"));
    }
  }

  const columns = useMemo(() => [
    {
      id: "name", header: t("mailTemplates.name"), accessorKey: "name",
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.name}</span>,
    },
    {
      id: "subject", header: t("mailTemplates.subject"), accessorKey: "subject",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.subject}</span>,
    },
    {
      id: "createdAt", header: t("mailTemplates.createdAt"), accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(i18n.language),
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
  ], [t, i18n.language, canEdit, canDelete]); // eslint-disable-line react-hooks/exhaustive-deps

  if (editing !== null) {
    return (
      <>
        <PanelHelmet title={t("mailTemplates.title")} />
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setEditing(null)}
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X size={16} />
            </button>
            <h1 className="text-xl font-bold">{editing.id ? t("mailTemplates.editTitle") : t("mailTemplates.newTitle")}</h1>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>{t("mailTemplates.name")}</Label>
              <Input
                placeholder={t("mailTemplates.namePlaceholder")}
                value={editing.name}
                onChange={(e) => setEditing(v => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("mailTemplates.subject")}</Label>
              <Input
                placeholder={t("mailTemplates.subjectPlaceholder")}
                value={editing.subject}
                onChange={(e) => setEditing(v => ({ ...v, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("mailTemplates.body")}</Label>
              <textarea
                rows={12}
                placeholder="<p>...</p>"
                value={editing.htmlBody}
                onChange={(e) => setEditing(v => ({ ...v, htmlBody: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Save size={14} /> {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHelmet title={t("mailTemplates.title")} />

      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button size="sm" className="gap-1.5" onClick={() => setEditing({ name: "", subject: "", htmlBody: "" })}>
            <Plus size={14} /> {t("mailTemplates.new")}
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
