import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, Layers, Image, Menu,
  Settings, Users, Shield, Activity, BookOpen, Globe,
  Inbox, Send, Rss, LayoutTemplate,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { usePermission } from "../../app/usePermission";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSlice";

function useNavGroups() {
  return [
    {
      labelKey: "Content",
      items: [
        { to: "/",            label: "Dashboard",  icon: LayoutDashboard, permission: "dashboard.view" },
        { to: "/page-models", label: "Page Models", icon: Layers,          permission: "pagemodels.view" },
        { to: "/pages",       label: "Content",    icon: FileText,        permission: "pages.view" },
        { to: "/media",       label: "Media",      icon: Image,           permission: "media.view" },
        { to: "/menus",       label: "Menus",      icon: Menu,            permission: "menus.manage" },
      ],
    },
    {
      labelKey: "Communication",
      items: [
        { to: "/contact",         label: "Contact Messages",       icon: Inbox,          permission: "contact.view" },
        { to: "/mail",            label: "Send Mail",          icon: Send,           permission: "mail.send" },
        { to: "/mail/templates",  label: "Mail Templates", icon: LayoutTemplate, permission: "mail.send" },
        { to: "/subscribers",     label: "Subscribers",   icon: Rss,            permission: "subscribers.view" },
      ],
    },
    {
      labelKey: "Administration",
      items: [
        { to: "/users",    label: "Users",    icon: Users,    permission: "users.manage" },
        { to: "/roles",    label: "Roles & Permissions",    icon: Shield,   permission: "roles.manage" },
        { to: "/activity", label: "Activity", icon: Activity, permission: "activity.view" },
      ],
    },
    {
      labelKey: "System",
      items: [
        { to: "/settings/languages", label: "Languages", icon: Globe,     permission: "settings.languages.manage" },
        { to: "/settings",           label: "Settings",  icon: Settings,  permission: "settings.general.edit" },
        { to: "/docs",               label: "Documentation",      icon: BookOpen,  permission: null },
      ],
    },
  ];
}

export default function Sidebar() {
  const navGroups = useNavGroups();
  const user = useAppSelector(selectCurrentUser);
  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 h-16 px-5 border-b border-sidebar-border">
        <img src="/LOGO.png" alt="NEXUS CMS" className="w-8 h-8 object-contain shrink-0" />
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-sidebar-foreground">NEXUS CMS</p>
          <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <NavGroup key={group.labelKey} label={group.labelKey} items={group.items} />
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.fullName || "Admin"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavGroup({ label, items }) {
  const anyVisible = items.some((item) => item.permission === null || true);
  if (!anyVisible) return null;

  return (
    <div>
      <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </ul>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, permission }) {
  const allowed = usePermission(permission ?? "");
  if (permission && !allowed) return null;

  return (
    <li>
      <NavLink
        to={to}
        end={to === "/" || to === "/mail" || to === "/settings"}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={16} className={isActive ? "text-primary" : "opacity-70 group-hover:opacity-100"} />
            {label}
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
          </>
        )}
      </NavLink>
    </li>
  );
}
