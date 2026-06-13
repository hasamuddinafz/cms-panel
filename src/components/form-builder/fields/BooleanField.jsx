import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function BooleanField({ field, value, onChange }) {
  return (
    <FieldWrapper field={field}>
      <label className="flex items-center gap-2 cursor-pointer">
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${value ? "bg-primary" : "bg-input"}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-1"}`}
          />
        </button>
        <Label>{field.label}</Label>
      </label>
    </FieldWrapper>
  );
}
