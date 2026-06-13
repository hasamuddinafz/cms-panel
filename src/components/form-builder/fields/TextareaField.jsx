import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function TextareaField({ field, value, onChange }) {
  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <textarea
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
      />
    </FieldWrapper>
  );
}
