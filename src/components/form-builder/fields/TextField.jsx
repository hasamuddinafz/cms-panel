import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function TextField({ field, value, onChange, lang }) {
  const id = `${field.key}-${lang ?? "default"}`;
  return (
    <FieldWrapper field={field}>
      <Label htmlFor={id}>{field.label}{field.required && " *"}</Label>
      <Input
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    </FieldWrapper>
  );
}
