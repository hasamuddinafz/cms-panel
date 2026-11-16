import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Search, X } from "lucide-react";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import FieldWrapper from "./FieldWrapper";

// Build searchable list from lucide-react exports (only PascalCase icon names)
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter((k) => /^[A-Z]/.test(k) && k !== "default");

export default function IconField({ field, value, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = value ? LucideIcons[value] : null;
  const filtered = ALL_ICON_NAMES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 120);

  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-accent transition-colors"
        >
          {SelectedIcon ? <SelectedIcon size={16} /> : null}
          <span className="text-muted-foreground">{value ?? "Select icon…"}</span>
        </button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} title="Clear">
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Picker modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-sm">Select Icon</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className="px-4 py-2 border-b">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-sm"
                  placeholder="Search icon…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-8 gap-1">
                {filtered.map((name) => {
                  const Icon = LucideIcons[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => { onChange(name); setOpen(false); }}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-md hover:bg-accent text-xs text-center transition-colors ${value === name ? "bg-primary/10 ring-1 ring-primary" : ""}`}
                    >
                      <Icon size={18} />
                      <span className="truncate w-full text-[10px] text-muted-foreground">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </FieldWrapper>
  );
}
