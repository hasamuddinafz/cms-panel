import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, CheckCircle, Plus, X, ChevronDown, ChevronUp, GripVertical, ExternalLink } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";
import {
  useGetPageInstanceByIdQuery,
  useCreatePageInstanceMutation,
  useUpdatePageInstanceMutation,
  usePublishPageMutation,
} from "../features/pages/pagesApi";
import { useGetPageModelListQuery, useGetPageModelByIdQuery } from "../features/pageModels/pageModelsApi";
import { useGetLanguagesQuery } from "../features/languages/languagesApi";
import { useGetSettingsQuery } from "../features/settings/settingsApi";

export default function PageEditorPage() {
  const { id } = useParams();               // edit mode: /pages/edit/:id
  const [searchParams] = useSearchParams(); // create mode: /pages/new?modelId=xxx
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existing }   = useGetPageInstanceByIdQuery(id, { skip: !id });
  const { data: modelList }  = useGetPageModelListQuery({ page: 1, pageSize: 100 });
  const { data: langs = [] } = useGetLanguagesQuery();
  const { data: appSettings } = useGetSettingsQuery();

  const [selectedModelId, setSelectedModelId] = useState(searchParams.get("modelId") ?? "");
  const [slug, setSlug]     = useState("");
  const [content, setContent] = useState({});
  const [seo, setSeo]         = useState({});

  const { data: selectedModel } = useGetPageModelByIdQuery(selectedModelId, { skip: !selectedModelId });

  const activeLangs = langs.filter((l) => l.isActive);
  const defaultLang = langs.find((l) => l.isDefault)?.code ?? activeLangs[0]?.code ?? "tr";
  const [activeLang, setActiveLang] = useState(defaultLang);

  // Populate when editing
  useEffect(() => {
    if (!existing) return;
    setSelectedModelId(existing.pageModelId ?? "");
    setSlug(existing.slug ?? "");
    const c = typeof existing.contentJson === "string" ? JSON.parse(existing.contentJson || "{}") : (existing.contentJson ?? {});
    const s = typeof existing.seoMetaJson === "string" ? JSON.parse(existing.seoMetaJson || "{}") : (existing.seoMetaJson ?? {});
    setContent(c);
    setSeo(s);
  }, [existing]);

  const schema = useMemo(() => {
    if (!selectedModel?.schemaJson) return { sections: [] };
    try {
      return typeof selectedModel.schemaJson === "string"
        ? JSON.parse(selectedModel.schemaJson)
        : selectedModel.schemaJson;
    } catch { return { sections: [] }; }
  }, [selectedModel]);

  const setFieldValue = useCallback((lang, sectionKey, fieldKey, value) => {
    setContent((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [sectionKey]: { ...(prev[lang]?.[sectionKey] ?? {}), [fieldKey]: value } },
    }));
  }, []);

  const setRepeaterValue = useCallback((lang, sectionKey, items) => {
    setContent((prev) => ({ ...prev, [lang]: { ...prev[lang], [sectionKey]: items } }));
  }, []);

  const getFieldValue    = (lang, sk, fk) => content[lang]?.[sk]?.[fk] ?? "";
  const getRepeaterValue = (lang, sk)     => Array.isArray(content[lang]?.[sk]) ? content[lang][sk] : [];

  const [createInstance, { isLoading: creating }] = useCreatePageInstanceMutation();
  const [updateInstance, { isLoading: updating }] = useUpdatePageInstanceMutation();
  const [publishPage,    { isLoading: publishing }] = usePublishPageMutation();
  const isBusy = creating || updating || publishing;

  const siteBaseUrl = (() => {
    try {
      const g = appSettings?.general;
      const parsed = typeof g === "string" ? JSON.parse(g) : g;
      return parsed?.siteBaseUrl?.replace(/\/$/, "") ?? "";
    } catch { return ""; }
  })();

  function handlePreview() {
    if (!slug.trim()) return;
    const base = siteBaseUrl || window.location.origin;
    window.open(`${base}/${slug.trim()}`, "_blank", "noopener,noreferrer");
  }

  async function save(andPublish = false) {
    if (!selectedModelId) { toast.error("Lütfen bir sayfa modeli seçin."); return; }
    if (!slug.trim())     { toast.error("Slug alanı zorunludur."); return; }

    const body = {
      pageModelId: selectedModelId,
      slug: slug.trim(),
      contentJson: JSON.stringify(content),
      seoMetaJson: JSON.stringify(seo),
    };

    try {
      let savedId = id;
      if (isEdit) {
        await updateInstance({ id, ...body }).unwrap();
        toast.success("Kaydedildi.");
      } else {
        const res = await createInstance(body).unwrap();
        savedId = res.id;
        toast.success("İçerik oluşturuldu.");
      }
      if (andPublish && savedId) {
        await publishPage(savedId).unwrap();
        toast.success("Yayınlandı!");
      }
      navigate("/pages");
    } catch (err) {
      toast.error(err?.data?.error ?? "Bir hata oluştu.");
    }
  }

  const pageTitle = isEdit ? "İçerik Düzenle" : "Yeni İçerik";

  return (
    <>
      <PanelHelmet title={pageTitle} />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/pages")}
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{pageTitle}</h1>
            {selectedModel && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Model: <span className="font-medium text-foreground">{selectedModel.name}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEdit && slug && (
            <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-muted-foreground" onClick={handlePreview} title="Ön izleme (yeni sekmede açılır)">
              <ExternalLink size={14} /> Önizle
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => save(false)} disabled={isBusy}>
            <Save size={14} /> Taslak Kaydet
          </Button>
          <Button size="sm" className="gap-1.5 h-9 px-4" onClick={() => save(true)} disabled={isBusy}>
            <CheckCircle size={14} /> Kaydet & Yayınla
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
        {/* ── Sol: İçerik alanları ── */}
        <div className="space-y-4">
          {/* Şema yoksa boş durum */}
          {!selectedModelId && (
            <div className="rounded-2xl border-2 border-dashed py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <ChevronDown size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Sağ panelden bir sayfa modeli seçin</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Form otomatik oluşacak</p>
            </div>
          )}

          {selectedModelId && schema.sections?.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed py-14 text-center">
              <p className="text-sm font-medium text-muted-foreground">Bu modelin şeması boş</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Sayfa Modelleri ekranından alan ekleyin</p>
            </div>
          )}

          {selectedModelId && schema.sections?.length > 0 && (
            <>
              {/* Dil sekmeleri */}
              {activeLangs.length > 1 && (
                <div className="flex gap-1 border-b mb-2">
                  {activeLangs.map((l) => (
                    <button
                      key={l.code} type="button"
                      onClick={() => setActiveLang(l.code)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                        activeLang === l.code
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {l.flagIcon} {l.name}
                    </button>
                  ))}
                </div>
              )}

              {schema.sections.map((section) => (
                <SectionBlock
                  key={section.key}
                  section={section}
                  lang={activeLang}
                  allLangs={activeLangs.map((l) => l.code)}
                  getFieldValue={getFieldValue}
                  setFieldValue={setFieldValue}
                  getRepeaterValue={getRepeaterValue}
                  setRepeaterValue={setRepeaterValue}
                />
              ))}
            </>
          )}
        </div>

        {/* ── Sağ: Ayarlar paneli ── */}
        <div className="space-y-3 sticky top-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Sayfa Ayarları</h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sayfa Modeli *</Label>
              <select
                className="w-full border rounded-xl pl-3 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                value={selectedModelId}
                onChange={(e) => { setSelectedModelId(e.target.value); setContent({}); }}
                disabled={isEdit}
              >
                <option value="">— Model seçin —</option>
                {modelList?.items?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {isEdit && (
                <p className="text-[11px] text-muted-foreground">Düzenleme modunda model değiştirilemez</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Slug *</Label>
              <Input
                placeholder="örn. hakkimizda"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />
              <p className="text-[11px] text-muted-foreground font-mono bg-muted/40 rounded-lg px-2 py-1 mt-1">
                /pages/<span className="text-foreground">{slug || "..."}</span>
              </p>
            </div>
          </div>

          {/* SEO */}
          <SeoBlock lang={activeLang} seo={seo} setSeo={setSeo} />
        </div>
      </div>
    </>
  );
}

/* ─── Section Block ─── */
function SectionBlock({ section, lang, allLangs, getFieldValue, setFieldValue, getRepeaterValue, setRepeaterValue }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 rounded-full bg-primary/40" />
          <span className="text-sm font-semibold">{section.label ?? section.key}</span>
          {section.repeatable && (
            <span className="text-[10px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full px-2 py-0.5">
              tekrarlı
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown size={15} className="text-muted-foreground" />
          : <ChevronUp size={15} className="text-muted-foreground" />
        }
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 pt-2 space-y-4 border-t bg-muted/5">
          {section.repeatable ? (
            <RepeaterField
              section={section}
              lang={lang}
              items={getRepeaterValue(lang, section.key)}
              onChange={(items) => setRepeaterValue(lang, section.key, items)}
            />
          ) : (
            section.fields?.map((field) => (
              <DynamicField
                key={field.key}
                field={field}
                lang={lang}
                allLangs={allLangs}
                getValue={(l) => getFieldValue(l, section.key, field.key)}
                setValue={(l, v) => setFieldValue(l, section.key, field.key, v)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Repeater ─── */
function RepeaterField({ section, lang, items, onChange }) {
  function addItem() {
    const blank = {};
    section.fields?.forEach((f) => { blank[f.key] = f.type === "boolean" ? false : ""; });
    onChange([...items, blank]);
  }

  return (
    <div className="space-y-3 pt-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
          Henüz öğe yok.
        </p>
      )}
      {items.map((item, idx) => (
        <div key={idx} className="border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/20">
            <GripVertical size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground flex-1">Öğe {idx + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="text-muted-foreground hover:text-destructive transition-colors">
              <X size={13} />
            </button>
          </div>
          <div className="px-4 py-3 space-y-3">
            {section.fields?.map((field) => (
              <SimpleField
                key={field.key}
                field={field}
                value={item[field.key] ?? ""}
                onChange={(v) => {
                  const next = items.map((it, i) => i === idx ? { ...it, [field.key]: v } : it);
                  onChange(next);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5 w-full" onClick={addItem}>
        <Plus size={13} /> Öğe Ekle
      </Button>
    </div>
  );
}

/* ─── Dynamic Field (translatable-aware) ─── */
function DynamicField({ field, lang, allLangs, getValue, setValue }) {
  const effectiveLang = field.translatable ? lang : (allLangs[0] ?? "tr");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label>{field.label ?? field.key}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
        {field.translatable && (
          <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded px-1.5 py-0.5">
            çevirilebilir
          </span>
        )}
      </div>
      <FieldInput field={field} value={getValue(effectiveLang)} onChange={(v) => setValue(effectiveLang, v)} />
    </div>
  );
}

/* ─── Simple Field (repeater rows) ─── */
function SimpleField({ field, value, onChange }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{field.label ?? field.key}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <FieldInput field={field} value={value} onChange={onChange} />
    </div>
  );
}

/* ─── Field Input Renderer ─── */
function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case "text":
      return <Input placeholder={`${field.label ?? field.key} girin`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;

    case "textarea":
      return (
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={4} placeholder={`${field.label ?? field.key} girin`}
          value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required}
        />
      );

    case "richtext":
      return <RichTextField value={value ?? ""} onChange={onChange} placeholder={`${field.label ?? field.key} girin`} />;

    case "number":
      return <Input type="number" placeholder="0" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;

    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-muted-foreground">{value ? "Açık" : "Kapalı"}</span>
        </label>
      );

    case "select":
      return (
        <select className="w-full border rounded-md pl-3 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required}>
          <option value="">— Seçin —</option>
          {field.options?.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
          ))}
        </select>
      );

    case "color":
      return (
        <div className="flex items-center gap-3">
          <input type="color" value={value || "#3b82f6"} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
          <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#3b82f6" className="w-32" />
        </div>
      );

    case "date":
      return <Input type="datetime-local" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;

    case "link":
      return <LinkField value={value} onChange={onChange} />;

    case "icon":
      return <Input placeholder="örn. Star, Home, ArrowRight" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;

    case "asset":
      return (
        <div className="flex items-center gap-2">
          <Input placeholder="/uploads/images/dosya.jpg" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          {value && <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-destructive shrink-0"><X size={14} /></button>}
        </div>
      );

    default:
      return <Input placeholder={`${field.label ?? field.key} girin`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

/* ─── Rich Text ─── */
function RichTextField({ value, onChange, placeholder }) {
  return (
    <div className="border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary">
      <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b bg-muted/30">
        {[
          { label: "B", title: "Kalın", cmd: "bold" },
          { label: "I", title: "İtalik", cmd: "italic" },
          { label: "U", title: "Altı çizili", cmd: "underline" },
        ].map(({ label, title, cmd }) => (
          <button key={cmd} type="button" title={title}
            className="w-6 h-6 text-xs font-bold rounded hover:bg-muted flex items-center justify-center"
            onMouseDown={(e) => { e.preventDefault(); document.execCommand(cmd); }}>
            {label}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {[["H2","H2"],["H3","H3"],["P","P"]].map(([label, val]) => (
          <button key={val} type="button"
            className="px-1.5 h-6 text-xs rounded hover:bg-muted flex items-center justify-center"
            onMouseDown={(e) => { e.preventDefault(); document.execCommand("formatBlock", false, val); }}>
            {label}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        <button type="button"
          className="px-1.5 h-6 text-xs rounded hover:bg-muted flex items-center justify-center"
          onMouseDown={(e) => { e.preventDefault(); document.execCommand("insertUnorderedList"); }}>
          • Liste
        </button>
      </div>
      <div
        contentEditable suppressContentEditableWarning
        className="min-h-[140px] px-4 py-3 text-sm outline-none"
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}

/* ─── Link Field ─── */
function LinkField({ value, onChange }) {
  const parsed = useMemo(() => {
    try { return typeof value === "object" && value !== null ? value : JSON.parse(value || "{}"); }
    catch { return {}; }
  }, [value]);

  function set(key, val) { onChange({ ...parsed, [key]: val }); }

  return (
    <div className="space-y-2">
      <Input placeholder="Buton metni (örn. Daha Fazla)" value={parsed.label ?? ""} onChange={(e) => set("label", e.target.value)} />
      <Input placeholder="URL (örn. /hizmetler veya https://...)" value={parsed.href ?? ""} onChange={(e) => set("href", e.target.value)} />
      <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
        <input type="checkbox" checked={!!parsed.newTab} onChange={(e) => set("newTab", e.target.checked)} className="rounded" />
        Yeni sekmede aç
      </label>
    </div>
  );
}

/* ─── SEO Block ─── */
function SeoBlock({ lang, seo, setSeo }) {
  const [collapsed, setCollapsed] = useState(true);
  function set(field, value) {
    setSeo((prev) => ({ ...prev, [lang]: { ...(prev[lang] ?? {}), [field]: value } }));
  }
  const s = seo[lang] ?? {};

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button type="button" onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <span className="text-sm font-semibold">SEO <span className="text-xs font-normal text-muted-foreground uppercase">{lang}</span></span>
        {collapsed ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronUp size={15} className="text-muted-foreground" />}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs">Sayfa Başlığı</Label>
            <Input placeholder="Sayfa Başlığı | Site Adı" value={s.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Meta Açıklama</Label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2} placeholder="150 karaktere kadar kısa açıklama"
              value={s.description ?? ""} onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">OG Görsel URL</Label>
            <Input placeholder="/uploads/images/og.jpg" value={s.ogImage ?? ""} onChange={(e) => set("ogImage", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
