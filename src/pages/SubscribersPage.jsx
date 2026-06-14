import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { Search, Trash2, ChevronLeft, ChevronRight, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetSubscribersQuery, useDeleteSubscriberMutation } from "../features/subscribers/subscribersApi";

export default function SubscribersPage() {
  const { t } = useTranslation();
  const [search, setSearch]     = useState("");
  const [isActive, setIsActive] = useState(undefined);
  const [page, setPage]         = useState(1);

  const { data, isFetching } = useGetSubscribersQuery({ search, isActive, page, pageSize: 20 });
  const [deleteSub]          = useDeleteSubscriberMutation();
  const confirm = useConfirm();

  async function handleDelete(id, email) {
    if (!await confirm(`"${email}" ${t("subscribers.deleteConfirm")}`)) return;
    await deleteSub(id);
    toast.success(t("subscribers.deleted"));
  }

  const items       = data?.items ?? [];
  const total       = data?.totalCount ?? 0;
  const totalPages  = data?.totalPages ?? 1;
  const activeCount = items.filter(s => s.isActive).length;

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t("subscribers.title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} {t("subscribers.totalActive").replace("·", `· ${activeCount}`)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("subscribers.searchPlaceholder")}
              className="w-full pl-8 pr-3 h-9 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={isActive === undefined ? "" : String(isActive)}
            onChange={e => { setIsActive(e.target.value === "" ? undefined : e.target.value === "true"); setPage(1); }}
            className="h-9 pl-3 pr-8 rounded-md border bg-card text-sm focus:outline-none"
          >
            <option value="">{t("subscribers.all")}</option>
            <option value="true">{t("subscribers.active")}</option>
            <option value="false">{t("subscribers.cancelled")}</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {isFetching ? (
            <div className="py-10 text-center text-sm text-muted-foreground">{t("subscribers.loading")}</div>
          ) : items.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Users size={36} className="opacity-20" />
              <p className="text-sm">{t("subscribers.notFound")}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("subscribers.email")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("subscribers.name")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("subscribers.status")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("subscribers.subscribedAt")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("subscribers.unsubscribedAt")}</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(sub => (
                  <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{sub.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.fullName ?? "—"}</td>
                    <td className="px-4 py-3">
                      {sub.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> {t("subscribers.activeLabel")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          <XCircle size={10} /> {t("subscribers.cancelledLabel")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(sub.subscribedAt).toLocaleDateString("tr")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString("tr") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(sub.id, sub.email)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-md flex items-center justify-center border hover:bg-muted disabled:opacity-40">
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-md flex items-center justify-center border hover:bg-muted disabled:opacity-40">
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
