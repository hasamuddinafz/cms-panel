import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function DateField({ field, value, onChange }) {
  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <Input
        type="datetime-local"
        value={value ? value.slice(0, 16) : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrapper>
  );
}
