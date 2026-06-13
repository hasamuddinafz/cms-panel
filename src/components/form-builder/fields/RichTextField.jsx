import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { Label } from "../../ui/label";
import FieldWrapper from "./FieldWrapper";

const toolbar = [
  { cmd: "toggleBold",   label: "B",   title: "Kalın" },
  { cmd: "toggleItalic", label: "I",   title: "İtalik" },
  { cmd: "toggleStrike", label: "S",   title: "Üstü çizili" },
  { cmd: "toggleBulletList", label: "• List", title: "Madde listesi" },
  { cmd: "toggleOrderedList", label: "1. List", title: "Sıralı liste" },
];

export default function RichTextField({ field, value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: field.placeholder ?? "İçerik girin…" }),
      Link.configure({ openOnClick: false }),
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value reset (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <FieldWrapper field={field}>
      <Label>{field.label}{field.required && " *"}</Label>
      <div className="rounded-md border border-input overflow-hidden">
        {/* Minimal toolbar */}
        <div className="flex flex-wrap gap-0.5 border-b p-1 bg-muted/30">
          {toolbar.map(({ cmd, label, title }) => (
            <button
              key={cmd}
              type="button"
              title={title}
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus()[cmd]().run();
              }}
              className="px-2 py-0.5 text-xs rounded hover:bg-accent"
            >
              {label}
            </button>
          ))}
        </div>
        <EditorContent editor={editor} className="min-h-[120px] px-3 py-2 text-sm prose prose-sm max-w-none focus:outline-none" />
      </div>
    </FieldWrapper>
  );
}
