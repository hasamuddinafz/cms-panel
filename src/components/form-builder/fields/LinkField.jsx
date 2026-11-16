import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function LinkField({ field, value, onChange }) {
  const val = value ?? { label: "", url: "", openInNewTab: false };

  function patch(key, newVal) {
    onChange({ ...val, [key]: newVal });
  }

  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <div className="space-y-2">
        <Input
          placeholder="Button text"
          value={val.label}
          onChange={(e) => patch("label", e.target.value)}
        />
        <Input
          placeholder="URL (e.g. /services or https://…)"
          value={val.url}
          onChange={(e) => patch("url", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!val.openInNewTab}
            onChange={(e) => patch("openInNewTab", e.target.checked)}
            className="rounded"
          />
          Open in new tab
        </label>
      </div>
    </FieldWrapper>
  );
}
