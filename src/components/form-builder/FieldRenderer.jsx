import TextField       from "./fields/TextField";
import TextareaField   from "./fields/TextareaField";
import RichTextField   from "./fields/RichTextField";
import NumberField     from "./fields/NumberField";
import BooleanField    from "./fields/BooleanField";
import SelectField     from "./fields/SelectField";
import DateField       from "./fields/DateField";
import ColorField      from "./fields/ColorField";
import LinkField       from "./fields/LinkField";
import AssetField      from "./fields/AssetField";
import IconField       from "./fields/IconField";
import RepeaterField   from "./fields/RepeaterField";

/**
 * Central switch — maps field.type string to the correct component.
 * All field components share the same props contract:
 *   field, value, onChange, lang (for translatable fields)
 */
export default function FieldRenderer({ field, value, onChange, lang }) {
  const props = { field, value, onChange, lang };

  switch (field.type) {
    case "text":      return <TextField      {...props} />;
    case "textarea":  return <TextareaField  {...props} />;
    case "richtext":  return <RichTextField  {...props} />;
    case "number":    return <NumberField    {...props} />;
    case "boolean":   return <BooleanField   {...props} />;
    case "select":    return <SelectField    {...props} />;
    case "date":      return <DateField      {...props} />;
    case "color":     return <ColorField     {...props} />;
    case "link":      return <LinkField      {...props} />;
    case "asset":     return <AssetField     {...props} />;
    case "icon":      return <IconField      {...props} />;
    case "repeater":  return <RepeaterField  {...props} />;
    case "group":     return <GroupField     {...props} />;
    default:
      return (
        <div className="text-xs text-muted-foreground border border-dashed rounded px-3 py-2">
          Bilinmeyen alan tipi: <strong>{field.type}</strong>
        </div>
      );
  }
}

// Inline group (non-repeating nested fields)
function GroupField({ field, value = {}, onChange, lang }) {
  return (
    <fieldset className="rounded-lg border p-3 space-y-3">
      <legend className="text-xs font-semibold px-1 text-muted-foreground">{field.label}</legend>
      {(field.fields ?? []).map((subField) => (
        <FieldRenderer
          key={subField.key}
          field={subField}
          value={value[subField.key]}
          onChange={(val) => onChange({ ...value, [subField.key]: val })}
          lang={lang}
        />
      ))}
    </fieldset>
  );
}
