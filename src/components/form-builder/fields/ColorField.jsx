import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function ColorField({ field, value, onChange }) {
  return (
    <FieldWrapper field={field}>
      <Label>{field.label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border border-input cursor-pointer p-0.5"
        />
        <span className="text-sm font-mono text-muted-foreground">{value ?? "#000000"}</span>
      </div>
    </FieldWrapper>
  );
}
