import { useState } from "react";
import { Image, FileText, Film, File, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";
import AssetPickerModal from "../AssetPickerModal";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const typeIcons = { Image, Document: FileText, Video: Film };

export default function AssetField({ field, value, onChange }) {
  const [open, setOpen] = useState(false);
  const Icon = typeIcons[value?.fileType] ?? File;

  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>

      {value ? (
        <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/30">
          {value.thumbnailUrl ? (
            <img
              src={`${BASE_URL}${value.thumbnailUrl}`}
              alt={value.fileName}
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            <Icon size={32} className="text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.fileName}</p>
            <p className="text-xs text-muted-foreground">{value.fileType}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            title="Kaldır"
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Dosya Seç…
        </Button>
      )}

      {!value && (
        <button
          type="button"
          className="text-xs text-primary underline underline-offset-2 mt-0.5"
          onClick={() => setOpen(true)}
        >
          {value ? "Değiştir" : ""}
        </button>
      )}

      {value && (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Değiştir
        </Button>
      )}

      <AssetPickerModal
        open={open}
        onClose={() => setOpen(false)}
        assetType={field.assetType}
        onSelect={(asset) => { onChange(asset); setOpen(false); }}
      />
    </FieldWrapper>
  );
}
