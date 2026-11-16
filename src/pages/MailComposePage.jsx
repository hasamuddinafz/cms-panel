import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Minus, Undo, Redo,
  Send, Plus, Trash2, AlignLeft, Users, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "../components/ui/ConfirmDialog";
import {
  useSendMailMutation,
  useSendBulkMailMutation,
  useGetMailTemplatesQuery,
} from "../features/mail/mailApi";

/* ─── TipTap Toolbar ─────────────────────────────────────────── */
function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`h-7 w-7 flex items-center justify-center rounded text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }) {
  if (!editor) return null;
  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-border bg-muted/30">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={13} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={13} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={13} /></ToolbarBtn>
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={13} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 size={13} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph"><AlignLeft size={13} /></ToolbarBtn>
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List size={13} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List"><ListOrdered size={13} /></ToolbarBtn>
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule"><Minus size={13} /></ToolbarBtn>
      <div className="flex-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo"><Undo size={13} /></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo"><Redo size={13} /></ToolbarBtn>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MailComposePage() {
  const [recipients, setRecipients] = useState([{ email: "", name: "" }]);
  const [subject, setSubject]       = useState("");
  const [sent, setSent]             = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const [sendMail,     { isLoading }]              = useSendMailMutation();
  const [sendBulkMail, { isLoading: bulkLoading }] = useSendBulkMailMutation();
  const { data: templatesData } = useGetMailTemplatesQuery({ page: 1, pageSize: 50 }, { skip: !showTemplates });
  const confirm = useConfirm();

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Write your mail content here… HTML is supported." })],
    editorProps: { attributes: { class: "tiptap-editor focus:outline-none min-h-[260px] px-4 py-3" } },
  });

  function addRecipient() { setRecipients(r => [...r, { email: "", name: "" }]); }
  function removeRecipient(i) { setRecipients(r => r.filter((_, idx) => idx !== i)); }
  function updateRecipient(i, field, value) {
    setRecipients(r => r.map((rec, idx) => idx === i ? { ...rec, [field]: value } : rec));
  }

  function loadTemplate(tpl) {
    setSubject(tpl.subject);
    if (editor) editor.commands.setContent(tpl.htmlBody);
    setShowTemplates(false);
  }

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const valid = recipients.filter(r => r.email.trim());
    if (!valid.length) { toast.error("At least one recipient email is required."); return; }
    if (!editor) return;
    const htmlBody = editor.getHTML();
    if (!htmlBody || htmlBody === "<p></p>") { toast.error("Mail body cannot be empty."); return; }

    const results = await Promise.allSettled(
      valid.map(r => sendMail({ toEmail: r.email.trim(), toName: r.name.trim() || r.email.trim(), subject, htmlBody }))
    );
    const succeeded = results.filter(r => r.status === "fulfilled" && !r.value?.error).length;
    const failed    = results.length - succeeded;
    if (succeeded > 0) {
      setSent(prev => [{ to: valid.map(r => r.email).join(", "), subject, sentAt: new Date() }, ...prev]);
      toast.success(`${succeeded} mail(s) sent.`);
      setRecipients([{ email: "", name: "" }]);
      setSubject("");
      editor.commands.clearContent();
    }
    if (failed > 0) toast.error(`${failed} mail(s) failed.`);
  }, [recipients, subject, editor, sendMail]);

  const handleSendBulk = useCallback(async () => {
    if (!editor) return;
    const htmlBody = editor.getHTML();
    if (!htmlBody || htmlBody === "<p></p>") { toast.error("Mail body cannot be empty."); return; }
    if (!subject.trim()) { toast.error("Subject cannot be empty."); return; }
    if (!await confirm("Mail will be sent to all active subscribers. Continue?", { title: "Bulk Send", confirmLabel: "Send" })) return;
    try {
      const res = await sendBulkMail({ subject, htmlBody }).unwrap();
      toast.success(`Mail sent to ${res.sent} subscriber(s).`);
      setSent(prev => [{ to: `${res.sent} subscriber(s)`, subject, sentAt: new Date() }, ...prev]);
    } catch {
      toast.error("Bulk send failed.");
    }
  }, [subject, editor, sendBulkMail, confirm]);

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>

      {/* Page title + actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Send Mail</h1>
        <div className="flex items-center gap-2">
          {/* Template picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <FileText size={14} /> Load Template
            </button>
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border bg-card shadow-lg z-20 overflow-hidden">
                {!templatesData?.items?.length ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground">No saved templates.</p>
                ) : (
                  <ul className="divide-y divide-border max-h-60 overflow-y-auto">
                    {templatesData.items.map((tpl) => (
                      <li key={tpl.id}>
                        <button type="button" onClick={() => loadTemplate(tpl)}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted/50 transition-colors">
                          <p className="font-medium text-foreground">{tpl.name}</p>
                          <p className="text-muted-foreground truncate">{tpl.subject}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button type="button" disabled={bulkLoading} onClick={handleSendBulk}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-60">
            <Users size={14} /> {bulkLoading ? "Sending…" : "All Subscribers"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        {/* Compose card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Recipients */}
          <div className="px-5 py-4 border-b border-border space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">Recipients</span>
              <button type="button" onClick={addRecipient}
                className="flex items-center gap-1 text-xs text-primary hover:underline ml-auto">
                <Plus size={11} /> Create
              </button>
            </div>
            {recipients.map((rec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="email"
                  value={rec.email}
                  onChange={e => updateRecipient(i, "email", e.target.value)}
                  placeholder="example@mail.com"
                  className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  value={rec.name}
                  onChange={e => updateRecipient(i, "name", e.target.value)}
                  placeholder="Full Name (optional)"
                  className="w-52 h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {recipients.length > 1 && (
                  <button type="button" onClick={() => removeRecipient(i)}
                    className="w-9 h-9 flex items-center justify-center rounded-md border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Subject */}
          <div className="px-5 py-3 border-b border-border flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">Subject</span>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              placeholder="Email subject"
              className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* TipTap editor */}
          <div className="flex flex-col">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
              <Send size={14} />
              {isLoading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        {/* Sent log */}
        {sent.length > 0 && (
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Sent This Session</p>
            <div className="space-y-1.5">
              {sent.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="font-medium truncate">{s.subject}</span>
                  <span className="text-muted-foreground">→ {s.to}</span>
                  <span className="text-muted-foreground ml-auto shrink-0">{s.sentAt.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </>
  );
}
