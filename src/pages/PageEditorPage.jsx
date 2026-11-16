import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Save, CheckCircle, Plus, X, ChevronDown, ChevronUp,
  GripVertical, ExternalLink, Upload, Image as ImageIcon, Search,
  Bold, Italic, Strikethrough, List, ListOrdered, Heading2, Heading3,
  Minus, Undo, Redo, Link as LinkIcon, AlignLeft,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
import { useGetFileListQuery, useUploadFileMutation } from "../features/media/mediaApi";

/* ─────────────────────────────────────────────────────────────────
   Page Editor
───────────────────────────────────────────────────────────────── */
export default function PageEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existing }     = useGetPageInstanceByIdQuery(id, { skip: !id });
  const { data: modelList }    = useGetPageModelListQuery({ page: 1, pageSize: 100 });
  const { data: langs = [] }   = useGetLanguagesQuery();
  const { data: appSettings }  = useGetSettingsQuery();

  const [selectedModelId, setSelectedModelId] = useState(searchParams.get("modelId") ?? "");
  const [slug,    setSlug]    = useState("");
  const [content, setContent] = useState({});
  const [seo,     setSeo]     = useState({});

  const { data: selectedModel } = useGetPageModelByIdQuery(selectedModelId, { skip: !selectedModelId });

  const activeLangs = langs.filter((l) => l.isActive);
  const defaultLang = langs.find((l) => l.isDefault)?.code ?? activeLangs[0]?.code ?? "en";
  const [activeLang, setActiveLang] = useState(defaultLang);

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

  const [createInstance, { isLoading: creating }]  = useCreatePageInstanceMutation();
  const [updateInstance, { isLoading: updating }]  = useUpdatePageInstanceMutation();
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
    window.open(`${siteBaseUrl || window.location.origin}/${slug.trim()}`, "_blank", "noopener,noreferrer");
  }

  async function save(andPublish = false) {
    if (!selectedModelId) { toast.error("Please select a page model."); return; }
    if (!slug.trim())     { toast.error("Slug is required."); return; }
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
        toast.success("Saved.");
      } else {
        const res = await createInstance(body).unwrap();
        savedId = res.id;
        toast.success("Content created.");
      }
      const alreadyPublished = existing?.status === "Published";
      if (andPublish && savedId && !alreadyPublished) {
        await publishPage(savedId).unwrap();
        toast.success("Published!");
      }
      navigate("/pages");
    } catch (err) {
      toast.error(err?.data?.error ?? "An error occurred.");
    }
  }

  const pageTitle = isEdit ? "Edit Content" : "New Content";

  return (
    <>
      <PanelHelmet title={pageTitle} />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/pages")}
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
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
            <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-muted-foreground" onClick={handlePreview}>
              <ExternalLink size={14} /> Preview
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => save(false)} disabled={isBusy}>
            <Save size={14} /> Save Draft
          </Button>
          <Button size="sm" className="gap-1.5 h-9 px-4" onClick={() => save(true)} disabled={isBusy}>
            <CheckCircle size={14} /> Save & Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
        {/* Left: content */}
        <div className="space-y-4">
          {!selectedModelId && (
            <div className="rounded-2xl border-2 border-dashed py-20 text-center">
              <ChevronDown size={22} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Select a page model from the right panel</p>
              <p className="text-xs text-muted-foreground/60 mt-1">The form will appear automatically</p>
            </div>
          )}

          {selectedModelId && schema.sections?.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed py-14 text-center">
              <p className="text-sm font-medium text-muted-foreground">This model has no schema</p>
            </div>
          )}

          {selectedModelId && schema.sections?.length > 0 && (
            <>
              {/* Language tabs — shown when 2+ active languages */}
              {activeLangs.length > 1 && (
                <div className="flex gap-1 border-b mb-2">
                  {activeLangs.map((l) => (
                    <button key={l.code} type="button" onClick={() => setActiveLang(l.code)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                        activeLang === l.code
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}>
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

        {/* Right: settings */}
        <div className="space-y-3 sticky top-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Page Settings</h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Page Model *</Label>
              <select
                className="w-full border rounded-xl pl-3 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                value={selectedModelId}
                onChange={(e) => { setSelectedModelId(e.target.value); setContent({}); }}
                disabled={isEdit}>
                <option value="">— Select model —</option>
                {modelList?.items?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {isEdit && <p className="text-[11px] text-muted-foreground">Model cannot be changed in edit mode</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Slug *</Label>
              <Input
                placeholder="example-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />
              <p className="text-[11px] text-muted-foreground font-mono bg-muted/40 rounded-lg px-2 py-1">
                /{slug || "..."}
              </p>
            </div>
          </div>

          <SeoBlock lang={activeLang} seo={seo} setSeo={setSeo} />
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Section Block
───────────────────────────────────────────────────────────────── */
function SectionBlock({ section, lang, allLangs, getFieldValue, setFieldValue, getRepeaterValue, setRepeaterValue }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <button type="button" onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 rounded-full bg-primary/40" />
          <span className="text-sm font-semibold">{section.label ?? section.key}</span>
          {section.repeatable && (
            <span className="text-[10px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full px-2 py-0.5">
              repeatable
            </span>
          )}
        </div>
        {collapsed ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronUp size={15} className="text-muted-foreground" />}
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

/* ─────────────────────────────────────────────────────────────────
   Repeater
───────────────────────────────────────────────────────────────── */
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
          No items yet.
        </p>
      )}
      {items.map((item, idx) => (
        <div key={idx} className="border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/20">
            <GripVertical size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground flex-1">Item {idx + 1}</span>
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
        <Plus size={13} /> Add Item
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Dynamic Field (translatable-aware)
───────────────────────────────────────────────────────────────── */
function DynamicField({ field, lang, allLangs, getValue, setValue }) {
  const isMultiLang = allLangs.length > 1;
  const effectiveLang = field.translatable ? lang : (allLangs[0] ?? "en");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Label>{field.label ?? field.key}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
        {field.translatable && isMultiLang && (
          <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded px-1.5 py-0.5">
            translatable
          </span>
        )}
        {!field.translatable && isMultiLang && (
          <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded px-1.5 py-0.5" title="This field shows the same value for all languages">
            shared
          </span>
        )}
      </div>
      {/* key forces remount when language changes — prevents TipTap/stateful fields from showing stale lang content */}
      <FieldInput key={`${field.key}-${effectiveLang}`} field={field} value={getValue(effectiveLang)} onChange={(v) => setValue(effectiveLang, v)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Simple Field (inside repeater rows)
───────────────────────────────────────────────────────────────── */
function SimpleField({ field, value, onChange }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{field.label ?? field.key}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <FieldInput field={field} value={value} onChange={onChange} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Field Input Renderer
───────────────────────────────────────────────────────────────── */
function FieldInput({ field, value, onChange }) {
  const ph = field.label ?? field.key;

  switch (field.type) {
    case "text":
      return <Input placeholder={ph} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;

    case "textarea":
      return (
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={4} placeholder={ph}
          value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required}
        />
      );

    case "richtext":
      return <RichTextField value={value ?? ""} onChange={onChange} placeholder={ph} />;

    case "number":
      return <Input type="number" placeholder="0" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;

    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-muted-foreground">{value ? "Active" : "Passive"}</span>
        </label>
      );

    case "select":
      return (
        <select className="w-full border rounded-md pl-3 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required}>
          <option value="">—</option>
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
      return <Input placeholder="Star, Home, ArrowRight…" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;

    case "asset":
      return <AssetField value={value ?? ""} onChange={onChange} />;

    default:
      return <Input placeholder={ph} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

/* ─────────────────────────────────────────────────────────────────
   TipTap Rich Text Field
───────────────────────────────────────────────────────────────── */
function RichTextField({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapLink.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: { attributes: { class: "tiptap-editor focus:outline-none min-h-[180px] px-4 py-3 text-sm" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  function addLink() {
    const url = window.prompt("URL:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike"><Strikethrough size={13} /></TBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2"><Heading2 size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3"><Heading3 size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph"><AlignLeft size={13} /></TBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list"><ListOrdered size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider"><Minus size={13} /></TBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <TBtn onClick={addLink} active={editor.isActive("link")} title="Link"><LinkIcon size={13} /></TBtn>
        {editor.isActive("link") && (
          <TBtn onClick={() => editor.chain().focus().unsetLink().run()} active={false} title="Remove link">
            <span className="text-[10px] font-semibold">unlink</span>
          </TBtn>
        )}
        <div className="flex-1" />
        <TBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo"><Undo size={13} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo"><Redo size={13} /></TBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function TBtn({ onClick, active, title, children }) {
  return (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={title}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Asset Field — inline upload + media picker modal
───────────────────────────────────────────────────────────────── */
function AssetField({ value, onChange }) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const fileRef               = useRef(null);

  const { data: fileList, isLoading: filesLoading } = useGetFileListQuery(
    { search, page, pageSize: 20 },
    { skip: !open }
  );
  const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await uploadFile(fd).unwrap();
      onChange(res.url);
      setOpen(false);
      toast.success("File uploaded.");
    } catch {
      toast.error("Upload failed.");
    }
    e.target.value = "";
  }

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  function toAbsolute(url) {
    if (!url) return url;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  }
  const isImage = value && /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(value);

  return (
    <>
      <div className="space-y-2">
        {/* Preview */}
        {value && (
          <div className="relative group w-full h-36 rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center">
            {isImage
              ? <img src={toAbsolute(value)} alt="" className="w-full h-full object-contain" />
              : <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs"><ImageIcon size={28} /><span className="truncate max-w-[200px]">{value.split("/").pop()}</span></div>
            }
            <button type="button" onClick={() => onChange("")}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5 flex-1" onClick={() => setOpen(true)}>
            <ImageIcon size={13} /> Select from Media
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={13} /> {uploading ? "Uploading…" : "Upload File"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf,video/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* Manual URL fallback */}
        <Input
          placeholder="/uploads/images/…"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs text-muted-foreground"
        />
      </div>

      {/* Media picker modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}>
          <div className="bg-background rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-sm">Media Library</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 border-b">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  className="w-full pl-8 pr-3 h-8 rounded-md border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Button type="button" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload size={13} /> Upload File
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {filesLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading…</div>
              ) : !fileList?.items?.length ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No records found.</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {fileList.items.map((file) => (
                    <button key={file.id} type="button"
                      onClick={() => { onChange(file.url); setOpen(false); }}
                      className="aspect-square rounded-lg border bg-muted/30 overflow-hidden hover:ring-2 hover:ring-primary transition-all flex items-center justify-center group">
                      {file.thumbnailUrl || /\.(jpg|jpeg|png|webp|gif|svg)/i.test(file.url)
                        ? <img src={toAbsolute(file.thumbnailUrl || file.url)} alt={file.fileName} className="w-full h-full object-cover" />
                        : <ImageIcon size={20} className="text-muted-foreground" />
                      }
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {fileList && fileList.totalCount > 20 && (
              <div className="flex items-center justify-between px-5 py-3 border-t text-xs text-muted-foreground">
                <span>{fileList.totalCount} files</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</Button>
                  <span className="flex items-center px-2">{page} / {Math.ceil(fileList.totalCount / 20)}</span>
                  <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(fileList.totalCount / 20)}>›</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Link Field
───────────────────────────────────────────────────────────────── */
function LinkField({ value, onChange }) {
  const parsed = useMemo(() => {
    try { return typeof value === "object" && value !== null ? value : JSON.parse(value || "{}"); }
    catch { return {}; }
  }, [value]);

  function set(key, val) { onChange({ ...parsed, [key]: val }); }

  return (
    <div className="space-y-2">
      <Input placeholder="Button text" value={parsed.label ?? ""} onChange={(e) => set("label", e.target.value)} />
      <Input placeholder="URL (/services or https://...)" value={parsed.href ?? ""} onChange={(e) => set("href", e.target.value)} />
      <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
        <input type="checkbox" checked={!!parsed.newTab} onChange={(e) => set("newTab", e.target.checked)} className="rounded" />
        Open in new tab
      </label>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SEO Block
───────────────────────────────────────────────────────────────── */
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
        <span className="text-sm font-semibold">
          SEO <span className="text-xs font-normal text-muted-foreground uppercase">{lang}</span>
        </span>
        {collapsed ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronUp size={15} className="text-muted-foreground" />}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs">Page Title</Label>
            <Input placeholder="Page Title" value={s.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Meta Description</Label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2} value={s.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">OG Image URL</Label>
            <AssetField value={s.ogImage ?? ""} onChange={(v) => set("ogImage", v)} />
          </div>
        </div>
      )}
    </div>
  );
}
