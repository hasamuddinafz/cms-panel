import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  useGetLanguagesQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
} from "../features/languages/languagesApi";

export default function LanguagesPage() {
  const { t } = useTranslation();
  const { data: languages = [], isLoading } = useGetLanguagesQuery();
  const [deleteLanguage] = useDeleteLanguageMutation();
  const confirm = useConfirm();
  const [modal, setModal] = useState(null);

  async function handleDelete(id, isDefault) {
    if (isDefault) return toast.error(t("languages.defaultCannotDelete"));
    if (!await confirm(t("confirm.deleteLanguage"))) return;
    try {
      await deleteLanguage(id).unwrap();
      toast.success(t("languages.deleted"));
    } catch {
      toast.error(t("languages.failed"));
    }
  }

  return (
    <>
      <PanelHelmet title={t("nav.languages")} />

      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ mode: "create" })}>
          <Plus size={14} /> {t("languages.addLanguage")}
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t("languages.code")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t("languages.name")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t("languages.flagIcon")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t("languages.status")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{t("languages.isDefault")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">{t("common.loading")}</td></tr>
            )}
            {languages.map((lang) => (
              <tr key={lang.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{lang.code}</td>
                <td className="px-4 py-3">{lang.name}</td>
                <td className="px-4 py-3 text-lg">{lang.flagIcon}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs rounded px-1.5 py-0.5 ${lang.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {lang.isActive ? t("common.active") : t("common.passive")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {lang.isDefault && <Star size={14} className="text-yellow-500 fill-yellow-400" />}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setModal({ mode: "edit", lang })}>
                      <Pencil size={13} />
                    </Button>
                    {!lang.isDefault && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(lang.id, lang.isDefault)}>
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && languages.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">{t("languages.noLanguages")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && <LanguageModal mode={modal.mode} lang={modal.lang} onClose={() => setModal(null)} />}
    </>
  );
}

function LanguageModal({ mode, lang, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    code: lang?.code ?? "",
    name: lang?.name ?? "",
    flagIcon: lang?.flagIcon ?? "",
    sortOrder: lang?.sortOrder ?? 0,
    isDefault: lang?.isDefault ?? false,
    isActive: lang?.isActive ?? true,
  });

  const [createLanguage, { isLoading: creating }] = useCreateLanguageMutation();
  const [updateLanguage, { isLoading: updating }] = useUpdateLanguageMutation();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "create") {
        await createLanguage(form).unwrap();
        toast.success(t("languages.added"));
      } else {
        await updateLanguage({ id: lang.id, ...form }).unwrap();
        toast.success(t("languages.updated"));
      }
      onClose();
    } catch {
      toast.error(t("languages.failed"));
    }
  }

  const isBusy = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">{mode === "create" ? t("languages.addLanguage") : t("languages.edit")}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("languages.code")} *</Label>
              <Input placeholder="tr" value={form.code} onChange={(e) => set("code", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("languages.name")} *</Label>
              <Input placeholder="Türkçe" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("languages.flagIcon")}</Label>
              <Input placeholder="🇹🇷" value={form.flagIcon} onChange={(e) => set("flagIcon", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("languages.sortOrder")}</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", +e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded" />
              {t("languages.isActive")}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="rounded" />
              {t("languages.isDefault")}
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={isBusy}>{isBusy ? t("common.saving") : t("common.save")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
