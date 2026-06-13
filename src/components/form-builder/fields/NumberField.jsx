import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function NumberField({ field, value, onChange }) {
  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
      />
    </FieldWrapper>
  );
}
