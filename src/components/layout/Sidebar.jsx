import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Image,
  Menu,
  Settings,
  Users,
  Shield,
  Activity,
  BookOpen,
  Globe,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { usePermission } from "../../app/usePermission";

const navItems = [
  { to: "/",          label: "Dashboard",       icon: LayoutDashboard, permission: "dashboard.view" },
  { to: "/page-models", label: "Sayfa Modelleri", icon: Layers,          permission: "pagemodels.view" },
  { to: "/pages",     label: "İçerik",          icon: FileText,        permission: "pages.view" },
  { to: "/media",     label: "Medya",            icon: Image,           permission: "media.view" },
  { to: "/menus",     label: "Menüler",          icon: Menu,            permission: "menus.manage" },
  { to: "/settings/languages", label: "Diller",  icon: Globe,           permission: "settings.languages.manage" },
  { to: "/settings",  label: "Ayarlar",          icon: Settings,        permission: "settings.general.edit" },
  { to: "/users",     label: "Kullanıcılar",     icon: Users,           permission: "users.manage" },
  { to: "/roles",     label: "Roller & Yetkiler",icon: Shield,          permission: "roles.manage" },
  { to: "/activity",  label: "Aktivite",         icon: Activity,        permission: "activity.view" },
  { to: "/docs",      label: "Dokümantasyon",    icon: BookOpen,        permission: null },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
        <span className="text-lg font-bold tracking-tight">NEXUS CMS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function NavItem({ to, label, icon: Icon, permission }) {
  const allowed = usePermission(permission ?? "");
  // items with no permission (docs) are always shown
  if (permission && !allowed) return null;

  return (
    <li>
      <NavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          )
        }
      >
        <Icon size={16} />
        {label}
      </NavLink>
    </li>
  );
}
