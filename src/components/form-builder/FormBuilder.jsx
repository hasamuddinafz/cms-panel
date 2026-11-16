import { useState, useCallback } from "react";
import FieldRenderer from "./FieldRenderer";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * Generic form engine driven by a section schema + current languages.
 *
 * Props:
 *   schema        – { sections: [ { key, label, repeatable, fields: [...] } ] }
 *   value         – { [lang]: { [sectionKey]: { [fieldKey]: any } | [...] } }
 *   onChange      – (newValue) => void
 *   languages     – [{ code, name }]  (active languages)
 *   defaultLang   – string (e.g. "en")
 */
export default function FormBuilder({ schema, value = {}, onChange, languages = [], defaultLang = "en" }) {
  const [activeLang, setActiveLang] = useState(defaultLang);

  const patchField = useCallback(
    (sectionKey, fieldKey, fieldValue, isRepeatable = false, itemIndex = null) => {
      onChange((prev) => {
        const langData = { ...(prev[activeLang] ?? {}) };

        if (isRepeatable && itemIndex !== null) {
          const arr = [...(langData[sectionKey] ?? [])];
          arr[itemIndex] = { ...(arr[itemIndex] ?? {}), [fieldKey]: fieldValue };
          langData[sectionKey] = arr;
        } else {
          langData[sectionKey] = { ...(langData[sectionKey] ?? {}), [fieldKey]: fieldValue };
        }

        return { ...prev, [activeLang]: langData };
      });
    },
    [activeLang, onChange]
  );

  const patchSection = useCallback(
    (sectionKey, sectionValue) => {
      onChange((prev) => ({
        ...prev,
        [activeLang]: { ...(prev[activeLang] ?? {}), [sectionKey]: sectionValue },
      }));
    },
    [activeLang, onChange]
  );

  const langData    = value[activeLang] ?? {};
  const sections    = schema?.sections ?? [];
  const hasMultiLang = languages.length > 1;

  return (
    <div className="space-y-6">
      {/* Language tabs (only if multiple languages) */}
      {hasMultiLang && (
        <div className="flex gap-1 border-b pb-0">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeLang === l.code
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const sectionVal = langData[section.key];

        return (
          <div key={section.key} className="rounded-xl border bg-card p-4 space-y-4">
            <h3 className="font-semibold text-sm">{section.label}</h3>

            {section.repeatable ? (
              /* Repeatable section — value is an array of items */
              <RepeaterSection
                section={section}
                value={Array.isArray(sectionVal) ? sectionVal : []}
                onChange={(newArr) => patchSection(section.key, newArr)}
                lang={activeLang}
              />
            ) : (
              /* Non-repeatable section — value is an object */
              (section.fields ?? []).map((field) => {
                // For non-translatable fields, always read from defaultLang
                const fieldLang  = field.translatable ? activeLang : defaultLang;
                const fieldData  = (value[fieldLang] ?? {})[section.key] ?? {};

                return (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    value={fieldData[field.key]}
                    lang={fieldLang}
                    onChange={(val) => {
                      // Non-translatable: write to defaultLang regardless of tab
                      if (!field.translatable) {
                        onChange((prev) => ({
                          ...prev,
                          [defaultLang]: {
                            ...(prev[defaultLang] ?? {}),
                            [section.key]: {
                              ...((prev[defaultLang] ?? {})[section.key] ?? {}),
                              [field.key]: val,
                            },
                          },
                        }));
                      } else {
                        patchField(section.key, field.key, val);
                      }
                    }}
                  />
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

function RepeaterSection({ section, value, onChange, lang }) {
  // Inline repeater section (same drag logic as RepeaterField but top-level)
  function addItem() {
    const empty = { _id: crypto.randomUUID() };
    (section.fields ?? []).forEach((f) => { empty[f.key] = null; });
    onChange([...value, empty]);
  }

  function removeItem(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function updateItem(idx, key, val) {
    onChange(value.map((item, i) => (i === idx ? { ...item, [key]: val } : item)));
  }

  const canAdd = !section.maxItems || value.length < section.maxItems;

  return (
    <div className="space-y-2">
      {value.map((item, idx) => (
        <div key={item._id ?? idx} className="rounded-lg border bg-muted/20 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-destructive hover:text-destructive/80 text-xs"
            >
              Delete
            </button>
          </div>
          {(section.fields ?? []).map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={item[field.key]}
              onChange={(val) => updateItem(idx, field.key, val)}
              lang={lang}
            />
          ))}
        </div>
      ))}
      {canAdd && (
        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          + Add Item
        </button>
      )}
    </div>
  );
}
