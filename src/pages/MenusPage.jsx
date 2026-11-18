import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ChevronRight } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useGetMenuListQuery, useGetMenuByKeyQuery, useUpsertMenuMutation } from "../features/menus/menusApi";
import { useGetLanguagesQuery } from "../features/languages/languagesApi";
import { getErrorMessage } from "../lib/errors";

const MENU_LABELS = {
  "navbar-desktop": "Navbar — Desktop",
  "navbar-mobile":  "Navbar — Mobile",
  "footer-desktop": "Footer — Desktop",
  "footer-mobile":  "Footer — Mobile",
};

function newItem() {
  return { id: crypto.randomUUID(), labelKey: {}, linkType: "external", target: "", icon: "", openInNewTab: false, children: [] };
}

export default function MenusPage() {
  const menuLabel = (key) => MENU_LABELS[key] ?? key;
  const { data: menuList = [] } = useGetMenuListQuery();
  const [activeKey, setActiveKey] = useState("navbar-desktop");

  return (
    <>
      <PanelHelmet title="Menus" />
      <div className="flex gap-6">
        <nav className="w-48 shrink-0 space-y-1">
          {(menuList.length > 0 ? menuList : Object.keys(MENU_LABELS)).map((m) => {
            const key = typeof m === "string" ? m : m.key;
            return (
              <button key={key} onClick={() => setActiveKey(key)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeKey === key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>
                {menuLabel(key)}
              </button>
            );
          })}
        </nav>
        <div className="flex-1"><MenuEditor key={activeKey} menuKey={activeKey} /></div>
      </div>
    </>
  );
}

function MenuEditor({ menuKey }) {
  const { data: menu, isLoading } = useGetMenuByKeyQuery(menuKey);
  const [upsert, { isLoading: saving }] = useUpsertMenuMutation();
  const [items, setItems] = useState(null);
  const { data: langs = [] } = useGetLanguagesQuery();
  const activeLangs = langs.filter((l) => l.isActive);
  const contentLangs = activeLangs.length ? activeLangs : [{ code: "en", name: "English", isDefault: true }];

  const currentItems = items ?? (menu ? (typeof menu.itemsJson === "string" ? JSON.parse(menu.itemsJson) : menu.itemsJson) : []);

  async function handleSave() {
    try {
      await upsert({ key: menuKey, items: currentItems }).unwrap();
      toast.success("Saved.");
      setItems(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Save failed."));
    }
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">{MENU_LABELS[menuKey] ?? menuKey}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => setItems([...currentItems, newItem()])}>
            <Plus size={14} /> Add Item
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {currentItems.length === 0 && (
          <div className="border rounded-lg py-10 text-center text-sm text-muted-foreground">
            No menu items yet. Use "Add Item" to start.
          </div>
        )}
        {currentItems.map((item, idx) => (
          <MenuItemRow
            key={item.id}
            item={item}
            langs={contentLangs}
            onChange={(updated) => {
              const next = [...currentItems];
              next[idx] = updated;
              setItems(next);
            }}
            onDelete={() => setItems(currentItems.filter((_, i) => i !== idx))}
          />
        ))}
      </div>
    </div>
  );
}

function MenuItemRow({ item, langs, onChange, onDelete }) {
  const [open, setOpen] = useState(false);

  function set(field, value) { onChange({ ...item, [field]: value }); }
  function setLabel(lang, value) { onChange({ ...item, labelKey: { ...item.labelKey, [lang]: value } }); }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/20">
        <GripVertical size={14} className="text-muted-foreground shrink-0" />
        <button type="button" onClick={() => setOpen(!open)} className="flex-1 text-left text-sm font-medium">
          {(item.labelKey?.[(langs.find((l) => l.isDefault) ?? langs[0])?.code] || Object.values(item.labelKey ?? {}).find(Boolean)) || <span className="text-muted-foreground italic">Enter label</span>}
        </button>
        <span className="text-xs text-muted-foreground">{item.target || "—"}</span>
        <button type="button" onClick={() => setOpen(!open)}>
          <ChevronRight size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-6 w-6" onClick={onDelete}>
          <Trash2 size={12} />
        </Button>
      </div>

      {open && (
        <div className="px-4 py-3 space-y-3 border-t bg-background">
          <div className="grid grid-cols-2 gap-3">
            {langs.map((l) => (
              <div key={l.code} className="space-y-1.5">
                <Label>Label ({l.code.toUpperCase()})</Label>
                <Input placeholder="e.g. Home" value={item.labelKey?.[l.code] ?? ""} onChange={(e) => setLabel(l.code, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Link Type</Label>
              <select className="w-full border rounded-md pl-3 pr-8 py-1.5 text-sm bg-background"
                value={item.linkType} onChange={(e) => set("linkType", e.target.value)}>
                <option value="external">External URL</option>
                <option value="page">Internal Page</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Target (URL / Slug)</Label>
              <Input placeholder="https://... or /about" value={item.target} onChange={(e) => set("target", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Input placeholder="Home" value={item.icon ?? ""} onChange={(e) => set("icon", e.target.value)} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={item.openInNewTab} onChange={(e) => set("openInNewTab", e.target.checked)} className="rounded" />
                Open in new tab
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Sub Items</Label>
              <Button size="sm" variant="outline" className="h-6 text-xs gap-1"
                onClick={() => set("children", [...(item.children ?? []), newItem()])}>
                <Plus size={11} /> Add Sub Item
              </Button>
            </div>
            {(item.children ?? []).map((child, ci) => (
              <div key={child.id} className="ml-4 border-l-2 border-muted pl-3">
                <MenuItemRow
                  item={child}
                  onChange={(updated) => {
                    const next = [...item.children];
                    next[ci] = updated;
                    set("children", next);
                  }}
                  onDelete={() => set("children", item.children.filter((_, i) => i !== ci))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
