import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Settings2, Layers, Type,
  AlignLeft, Code2, Hash, ToggleLeft, List, Image,
  Link2, Palette, Calendar, Repeat2, Check,
} from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";
import {
  useGetPageModelByIdQuery,
  useCreatePageModelMutation,
  useUpdatePageModelMutation,
} from "../features/pageModels/pageModelsApi";

/* ─── Field type registry ─── */
const FIELD_TYPES = [
  { value: "text",     label: "Metin",          desc: "Tek satır",          icon: Type,       color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
  { value: "textarea", label: "Uzun Metin",      desc: "Çok satır",          icon: AlignLeft,  color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
  { value: "richtext", label: "Zengin Metin",    desc: "Editör",             icon: Code2,      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" },
  { value: "number",   label: "Sayı",            desc: "Tam / ondalık",      icon: Hash,       color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" },
  { value: "boolean",  label: "Açık / Kapalı",   desc: "Toggle",             icon: ToggleLeft, color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" },
  { value: "select",   label: "Seçim Listesi",   desc: "Dropdown",           icon: List,       color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400" },
  { value: "asset",    label: "Medya",           desc: "Görsel / Dosya",     icon: Image,      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400" },
  { value: "link",     label: "Bağlantı",        desc: "URL + etiket",       icon: Link2,      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400" },
  { value: "color",    label: "Renk",            desc: "Renk seçici",        icon: Palette,    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" },
  { value: "date",     label: "Tarih / Saat",    desc: "Date picker",        icon: Calendar,   color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400" },
  { value: "repeater", label: "Tekrarlanan Grup", desc: "Dinamik liste",     icon: Repeat2,    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" },
];

function typeInfo(type) {
  return FIELD_TYPES.find((t) => t.value === type) ?? FIELD_TYPES[0];
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
function newField() {
  return { key: "", label: "", type: "text", translatable: false, required: false };
}
function newSection() {
  return { key: "", label: "", repeatable: false, fields: [newField()] };
}

/* ══════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════ */
export default function PageModelEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existing } = useGetPageModelByIdQuery(id, { skip: !id });
  const [createModel, { isLoading: creating }] = useCreatePageModelMutation();
  const [updateModel, { isLoading: updating }] = useUpdatePageModelMutation();
  const isBusy = creating || updating;

  const [name,        setName]        = useState("");
  const [key,         setKey]         = useState("");
  const [description, setDescription] = useState("");
  const [icon,        setIcon]        = useState("");
  const [isSingleton, setIsSingleton] = useState(false);
  const [sections,    setSections]    = useState([newSection()]);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name ?? "");
    setKey(existing.key ?? "");
    setDescription(existing.description ?? "");
    setIcon(existing.icon ?? "");
    setIsSingleton(existing.isSingleton ?? false);
    try {
      const schema = typeof existing.schemaJson === "string"
        ? JSON.parse(existing.schemaJson)
        : existing.schemaJson;
      if (schema?.sections?.length) setSections(schema.sections);
    } catch {}
  }, [existing]);

  function handleNameChange(v) {
    setName(v);
    if (!isEdit) setKey(slugify(v));
  }

  /* Section ops */
  const addSection    = ()          => setSections((s) => [...s, newSection()]);
  const removeSection = (si)        => setSections((s) => s.filter((_, i) => i !== si));
  const updateSection = (si, patch) => setSections((s) => s.map((sec, i) => i === si ? { ...sec, ...patch } : sec));
  const moveSection   = (si, dir)   => setSections((s) => {
    const n = [...s]; const to = si + dir;
    if (to < 0 || to >= n.length) return s;
    [n[si], n[to]] = [n[to], n[si]]; return n;
  });

  /* Field ops */
  const addField    = (si)          => setSections((s) => s.map((sec, i) => i === si ? { ...sec, fields: [...(sec.fields ?? []), newField()] } : sec));
  const removeField = (si, fi)      => setSections((s) => s.map((sec, i) => i === si ? { ...sec, fields: sec.fields.filter((_, j) => j !== fi) } : sec));
  const updateField = (si, fi, p)   => setSections((s) => s.map((sec, i) => i === si ? { ...sec, fields: sec.fields.map((f, j) => j === fi ? { ...f, ...p } : f) } : sec));
  const moveField   = (si, fi, dir) => setSections((s) => s.map((sec, i) => {
    if (i !== si) return sec;
    const n = [...sec.fields]; const to = fi + dir;
    if (to < 0 || to >= n.length) return sec;
    [n[fi], n[to]] = [n[to], n[fi]]; return { ...sec, fields: n };
  }));

  async function handleSave() {
    if (!name.trim()) { toast.error("Model adı zorunludur."); return; }
    if (!key.trim())  { toast.error("Key zorunludur."); return; }
    for (const sec of sections) {
      if (!sec.key.trim()) { toast.error("Tüm bölümlerin key alanı dolu olmalı."); return; }
      for (const f of sec.fields ?? []) {
        if (!f.key.trim()) { toast.error(`"${sec.label || sec.key}" bölümünde boş key'li alan var.`); return; }
      }
    }
    const schemaJson = JSON.stringify({ sections });
    try {
      if (isEdit) {
        await updateModel({ id, name, key, description, icon, isSingleton, schemaJson }).unwrap();
        toast.success("Model güncellendi.");
      } else {
        await createModel({ name, key, description, icon, isSingleton, schemaJson }).unwrap();
        toast.success("Model oluşturuldu.");
      }
      navigate("/page-models");
    } catch (err) {
      toast.error(err?.data?.error ?? "Bir hata oluştu.");
    }
  }

  return (
    <>
      <PanelHelmet title={isEdit ? "Model Düzenle" : "Yeni Model"} />

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/page-models")}
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{isEdit ? "Model Düzenle" : "Yeni Sayfa Modeli"}</h1>
            {key && <p className="text-xs text-muted-foreground mt-0.5 font-mono">/{key}</p>}
          </div>
        </div>
        <Button size="sm" className="gap-2 h-9 px-4" onClick={handleSave} disabled={isBusy}>
          <Save size={14} />
          {isBusy ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_272px] gap-6 items-start">

        {/* ════════════════ Sol: Bölümler ════════════════ */}
        <div className="space-y-4">

          {/* Section list header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Bölümler</span>
              <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{sections.length}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={addSection}>
              <Plus size={13} /> Bölüm Ekle
            </Button>
          </div>

          {sections.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed py-16 text-center">
              <Layers size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Henüz bölüm yok</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Yukarıdaki "Bölüm Ekle" butonuyla başlayın</p>
            </div>
          )}

          {sections.map((sec, si) => (
            <SectionCard
              key={si}
              section={sec}
              sectionIndex={si}
              totalSections={sections.length}
              onUpdate={(p)      => updateSection(si, p)}
              onRemove={()       => removeSection(si)}
              onMove={(dir)      => moveSection(si, dir)}
              onAddField={()     => addField(si)}
              onRemoveField={(fi)=> removeField(si, fi)}
              onUpdateField={(fi, p) => updateField(si, fi, p)}
              onMoveField={(fi, dir) => moveField(si, fi, dir)}
            />
          ))}
        </div>

        {/* ════════════════ Sağ: Model bilgileri ════════════════ */}
        <div className="space-y-3 sticky top-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings2 size={14} className="text-muted-foreground" />
              Model Bilgileri
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Model Adı *</Label>
                <Input
                  placeholder="örn. Blog Yazısı"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Key *</Label>
                <div className="relative">
                  <Input
                    placeholder="blog-post"
                    value={key}
                    onChange={(e) => setKey(slugify(e.target.value))}
                    className="font-mono text-xs pr-8"
                  />
                  {key && (
                    <Check size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">API'de kullanılır, sonradan değiştirmeyin</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Açıklama</Label>
                <Input placeholder="Kısa açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">İkon</Label>
                <Input placeholder="FileText, Globe, Star…" value={icon} onChange={(e) => setIcon(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">Lucide ikon adı (PascalCase)</p>
              </div>
            </div>

            <div className={cn(
              "flex items-start gap-3 rounded-xl p-3 cursor-pointer border-2 transition-colors select-none",
              isSingleton ? "border-primary/40 bg-primary/5" : "border-transparent bg-muted/30 hover:bg-muted/50"
            )} onClick={() => setIsSingleton((v) => !v)}>
              <div className={cn(
                "w-4 h-4 rounded flex items-center justify-center border-2 mt-0.5 shrink-0 transition-colors",
                isSingleton ? "bg-primary border-primary" : "border-muted-foreground/40"
              )}>
                {isSingleton && <Check size={10} className="text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium">Singleton</p>
                <p className="text-xs text-muted-foreground mt-0.5">Bu modelden yalnızca 1 içerik oluşturulabilir (örn. Anasayfa)</p>
              </div>
            </div>
          </div>

          {/* Field type legend */}
          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alan Tipleri</p>
            <div className="space-y-1.5">
              {FIELD_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.value} className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0", t.color)}>
                      <Icon size={11} />
                    </div>
                    <span className="text-xs text-muted-foreground">{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   Section Card
══════════════════════════════════════════════ */
function SectionCard({
  section, sectionIndex, totalSections,
  onUpdate, onRemove, onMove,
  onAddField, onRemoveField, onUpdateField, onMoveField,
}) {
  const [collapsed, setCollapsed] = useState(false);

  function handleLabelChange(v) {
    onUpdate({ label: v, key: section.key || slugify(v) });
  }

  const fieldCount = section.fields?.length ?? 0;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">

      {/* ── Section Header ── */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Move arrows */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button type="button" onClick={() => onMove(-1)} disabled={sectionIndex === 0}
            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors rounded hover:bg-muted">
            <ChevronUp size={12} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={sectionIndex === totalSections - 1}
            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors rounded hover:bg-muted">
            <ChevronDown size={12} />
          </button>
        </div>

        <GripVertical size={14} className="text-muted-foreground/30 shrink-0" />

        {/* Section name + key */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <Input
            placeholder="Bölüm adı (örn. Hero Alanı)"
            value={section.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="h-8 text-sm font-medium"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">#</span>
            <Input
              placeholder="hero"
              value={section.key}
              onChange={(e) => onUpdate({ key: slugify(e.target.value) })}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        {/* Repeatable badge */}
        <div
          onClick={() => onUpdate({ repeatable: !section.repeatable })}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-colors shrink-0",
            section.repeatable
              ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
              : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
          )}
        >
          <Repeat2 size={11} />
          Tekrarlı
        </div>

        {/* Field count */}
        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 shrink-0">
          {fieldCount} alan
        </span>

        {/* Collapse */}
        <button type="button" onClick={() => setCollapsed((v) => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Delete */}
        <button type="button" onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {/* ── Fields ── */}
      {!collapsed && (
        <div className="border-t bg-muted/10 px-4 py-3 space-y-2">
          {fieldCount === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">
              Henüz alan yok. Aşağıdan ekleyin.
            </p>
          )}

          {(section.fields ?? []).map((field, fi) => (
            <FieldRow
              key={fi}
              field={field}
              fieldIndex={fi}
              totalFields={fieldCount}
              onUpdate={(p)   => onUpdateField(fi, p)}
              onRemove={()    => onRemoveField(fi)}
              onMove={(dir)   => onMoveField(fi, dir)}
            />
          ))}

          <button
            type="button"
            onClick={onAddField}
            className="w-full flex items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-2.5 text-xs text-muted-foreground hover:text-primary hover:border-primary transition-colors mt-1"
          >
            <Plus size={13} /> Alan Ekle
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Field Row
══════════════════════════════════════════════ */
function FieldRow({ field, fieldIndex, totalFields, onUpdate, onRemove, onMove }) {
  const [expanded, setExpanded] = useState(false);
  const info = typeInfo(field.type);
  const Icon = info.icon;

  function handleLabelChange(v) {
    onUpdate({ label: v, key: field.key || slugify(v) });
  }

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all",
      expanded ? "border-primary/30 shadow-sm" : ""
    )}>
      {/* ── Compact row ── */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">

        {/* Move */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button type="button" onClick={() => onMove(-1)} disabled={fieldIndex === 0}
            className="w-4 h-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors">
            <ChevronUp size={10} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={fieldIndex === totalFields - 1}
            className="w-4 h-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors">
            <ChevronDown size={10} />
          </button>
        </div>

        {/* Type icon */}
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", info.color)}>
          <Icon size={13} />
        </div>

        {/* Label */}
        <Input
          placeholder="Alan adı (örn. Başlık)"
          value={field.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="h-8 text-sm flex-1 min-w-0"
        />

        {/* Key */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-muted-foreground">#</span>
          <Input
            placeholder="baslik"
            value={field.key}
            onChange={(e) => onUpdate({ key: slugify(e.target.value) })}
            className="h-8 text-xs font-mono w-24"
          />
        </div>

        {/* Type selector */}
        <select
          className="h-8 border rounded-md pl-2 pr-7 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
          value={field.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Badges */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onUpdate({ required: !field.required })}
            title="Zorunlu alan"
            className={cn(
              "h-6 px-2 rounded-md text-[10px] font-medium border transition-colors",
              field.required
                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            Zorunlu
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ translatable: !field.translatable })}
            title="Çevirilebilir alan"
            className={cn(
              "h-6 px-2 rounded-md text-[10px] font-medium border transition-colors",
              field.translatable
                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            Çeviri
          </button>
        </div>

        {/* Expand */}
        <button type="button" onClick={() => setExpanded((v) => !v)}
          title="Gelişmiş ayarlar"
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0",
            expanded ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
          <Settings2 size={13} />
        </button>

        {/* Delete */}
        <button type="button" onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Expanded options ── */}
      {expanded && (
        <div className="border-t bg-muted/5 px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Placeholder metni</Label>
              <Input
                placeholder="Kullanıcıya gösterilecek ipucu…"
                value={field.placeholder ?? ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {field.type === "asset" && (
              <div className="space-y-1.5">
                <Label className="text-xs">İzin verilen medya tipi</Label>
                <select
                  className="w-full h-8 border rounded-md pl-2 pr-7 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  value={field.assetType ?? ""}
                  onChange={(e) => onUpdate({ assetType: e.target.value })}
                >
                  <option value="">Hepsi</option>
                  <option value="image">Sadece Görsel</option>
                  <option value="document">Sadece Belge</option>
                  <option value="video">Sadece Video</option>
                </select>
              </div>
            )}

            {field.type === "number" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min değer</Label>
                  <Input type="number" placeholder="0" value={field.min ?? ""} onChange={(e) => onUpdate({ min: e.target.value })} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max değer</Label>
                  <Input type="number" placeholder="100" value={field.max ?? ""} onChange={(e) => onUpdate({ max: e.target.value })} className="h-8 text-xs" />
                </div>
              </>
            )}
          </div>

          {field.type === "select" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Seçenekler <span className="text-muted-foreground font-normal">(her satıra bir seçenek — değer:Etiket veya sadece değer)</span></Label>
              <textarea
                className="w-full border rounded-xl px-3 py-2 text-xs bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={4}
                placeholder={"kucuk:Küçük\norta:Orta\nbuyuk:Büyük"}
                value={(field.options ?? []).map((o) =>
                  o.value && o.label !== o.value ? `${o.value}:${o.label}` : (o.value ?? o)
                ).join("\n")}
                onChange={(e) => {
                  const opts = e.target.value.split("\n").filter(Boolean).map((line) => {
                    const [val, ...rest] = line.split(":");
                    return rest.length
                      ? { value: val.trim(), label: rest.join(":").trim() }
                      : { value: val.trim(), label: val.trim() };
                  });
                  onUpdate({ options: opts });
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
