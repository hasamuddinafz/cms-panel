import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { Mail, Trash2, Reply, CheckCircle, Circle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  useGetContactMessagesQuery,
  useMarkContactReadMutation,
  useReplyContactMutation,
  useDeleteContactMessageMutation,
} from "../features/contact/contactApi";

export default function ContactPage() {
  const [search, setSearch]     = useState("");
  const [isRead, setIsRead]     = useState(undefined);
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);

  const { data, isFetching } = useGetContactMessagesQuery({ search, isRead, page, pageSize: 20 });
  const [markRead]   = useMarkContactReadMutation();
  const [reply]      = useReplyContactMutation();
  const [deletMsg]   = useDeleteContactMessageMutation();
  const confirm = useConfirm();

  async function openMsg(msg) {
    setSelected(msg);
    if (!msg.isRead) {
      await markRead({ id: msg.id, isRead: true });
    }
  }

  async function handleDelete(id) {
    if (!await confirm("Are you sure you want to delete this message?")) return;
    await deletMsg(id);
    if (selected?.id === id) setSelected(null);
    toast.success("Message deleted.");
  }

  const items      = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const unread     = items.filter(m => !m.isRead).length;

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Contact Messages</h1>
            {unread > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">{unread} unread messages</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email or subject…"
              className="w-full pl-8 pr-3 h-9 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={isRead === undefined ? "" : String(isRead)}
            onChange={e => { setIsRead(e.target.value === "" ? undefined : e.target.value === "true"); setPage(1); }}
            className="h-9 pl-3 pr-8 rounded-md border bg-card text-sm focus:outline-none"
          >
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>

        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          <div className="w-96 shrink-0 flex flex-col gap-1 overflow-y-auto">
            {isFetching && <p className="text-sm text-muted-foreground p-2">Loading…</p>}
            {!isFetching && items.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">No messages found.</div>
            )}
            {items.map(msg => (
              <button
                key={msg.id}
                onClick={() => openMsg(msg)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selected?.id === msg.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card hover:bg-muted/40 border-border"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    {msg.isRead
                      ? <CheckCircle size={14} className="text-muted-foreground/40" />
                      : <Circle size={14} className="text-primary fill-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm truncate ${!msg.isRead ? "font-semibold" : "font-medium"}`}>
                        {msg.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{msg.subject}</p>
                  </div>
                </div>
              </button>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 rounded flex items-center justify-center border hover:bg-muted disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center border hover:bg-muted disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-card border border-border rounded-xl">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Mail size={40} className="opacity-20" />
                <p className="text-sm">Select a message to read</p>
              </div>
            ) : (
              <MessageDetail
                msg={selected}
                onDelete={handleDelete}
                onReply={() => setReplyOpen(true)}
                replyLabel="Reply"
              />
            )}
          </div>
        </div>
      </div>

      {replyOpen && selected && (
        <ReplyModal
          msg={selected}
          onClose={() => setReplyOpen(false)}
          onSend={async (body) => {
            const r = await reply({ id: selected.id, ...body });
            if (r.error) { toast.error("Could not send mail."); return; }
            toast.success("Reply sent.");
            setReplyOpen(false);
          }}
        />
      )}
    </>
  );
}

function MessageDetail({ msg, onDelete, onReply, replyLabel }) {
  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{msg.subject}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-medium text-foreground">{msg.fullName}</span>
            {" — "}{msg.email}
            {msg.phone && <> · {msg.phone}</>}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(msg.createdAt).toLocaleString("en-US")}
            {msg.ipAddress && <> · IP: {msg.ipAddress}</>}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onReply}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            <Reply size={13} /> {replyLabel}
          </button>
          <button onClick={() => onDelete(msg.id)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <hr className="border-border" />

      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</div>
    </div>
  );
}

function ReplyModal({ msg, onClose, onSend }) {
  const [subject, setSubject] = useState(`Re: ${msg.subject}`);
  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    await onSend({
      toEmail: msg.email,
      toName: msg.fullName,
      subject,
      htmlBody: body.replace(/\n/g, "<br>"),
    });
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card rounded-xl border border-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Reply — {msg.fullName}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Recipient</label>
            <input value={msg.email} disabled className="w-full h-9 px-3 rounded-md border bg-muted/40 text-sm text-muted-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={8}
              placeholder="Write your reply…"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="h-8 px-4 rounded-md text-sm border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={sending}
              className="h-8 px-4 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
