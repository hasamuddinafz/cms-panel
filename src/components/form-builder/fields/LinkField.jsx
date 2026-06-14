import { useTranslation } from "react-i18next";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

export default function LinkField({ field, value, onChange }) {
  const { t } = useTranslation();
  const val = value ?? { label: "", url: "", openInNewTab: false };

  function patch(key, newVal) {
    onChange({ ...val, [key]: newVal });
  }

  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <div className="space-y-2">
        <Input
          placeholder={t("common.buttonLabel")}
          value={val.label}
          onChange={(e) => patch("label", e.target.value)}
        />
        <Input
          placeholder={t("common.urlPlaceholder")}
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
          {t("common.openInNewTab")}
        </label>
      </div>
    </FieldWrapper>
  );
}
