import { useTranslation } from "react-i18next";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function SelectField({ field, value, onChange }) {
  const { t } = useTranslation();
  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <select
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("common.selectOption")}</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
