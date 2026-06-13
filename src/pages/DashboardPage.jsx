import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye, FileText, Image, Users, TrendingUp, Activity } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  useGetDashboardStatsQuery,
  useGetViewTrendQuery,
  useGetTopPagesQuery,
  useGetRecentActivityQuery,
} from "../features/dashboard/dashboardApi";

const ACTION_LABELS = {
  Created:   "Oluşturuldu",
  Updated:   "Güncellendi",
  Deleted:   "Silindi",
  Published: "Yayınlandı",
  LoggedIn:  "Giriş Yaptı",
};

export default function DashboardPage() {
  const { data: stats }    = useGetDashboardStatsQuery();
  const { data: trend }    = useGetViewTrendQuery(30);
  const { data: topPages } = useGetTopPagesQuery(10);
  const { data: activity } = useGetRecentActivityQuery(15);

  const statCards = [
    { label: "Toplam Sayfa",        value: stats?.totalPages,     icon: FileText,   color: "text-blue-500" },
    { label: "Yayındaki Sayfa",     value: stats?.publishedPages, icon: TrendingUp, color: "text-green-500" },
    { label: "Toplam Görüntülenme", value: stats?.totalViews?.toLocaleString(), icon: Eye, color: "text-purple-500" },
    { label: "Bugünkü Görüntülenme",value: stats?.todayViews,     icon: Activity,   color: "text-orange-500" },
    { label: "Medya Dosyası",       value: stats?.totalAssets,    icon: Image,      color: "text-pink-500" },
    { label: "Kullanıcı",           value: stats?.totalUsers,     icon: Users,      color: "text-cyan-500" },
  ];

  return (
    <>
      <PanelHelmet title="Dashboard" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-1">{value ?? "—"}</p>
                </div>
                <Icon size={20} className={color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Trend chart — takes 2/3 */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Son 30 Gün — Günlük Görüntülenme</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.slice(5)} /* MM-DD */
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v) => [v, "Görüntülenme"]}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(221.2 83.2% 53.3%)"
                  strokeWidth={2}
                  fill="url(#viewGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent activity — 1/3 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y max-h-[240px] overflow-y-auto">
              {(activity ?? []).map((a) => (
                <li key={a.id} className="px-4 py-2.5 space-y-0.5">
                  <p className="text-xs font-medium">
                    {ACTION_LABELS[a.action] ?? a.action}{" "}
                    <span className="text-muted-foreground font-normal">— {a.entityType}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.userEmail ?? "Sistem"} · {new Date(a.createdAt).toLocaleString("tr-TR")}
                  </p>
                </li>
              ))}
              {!activity?.length && (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Henüz aktivite yok.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Top pages table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">En Çok Görüntülenen Sayfalar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Slug</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Model</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Görüntülenme</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(topPages ?? []).map((p, i) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
                      {p.modelKey}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    <span className="flex items-center justify-end gap-1">
                      <Eye size={11} className="text-muted-foreground" />
                      {p.viewCount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {!topPages?.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    Henüz yayında sayfa yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
