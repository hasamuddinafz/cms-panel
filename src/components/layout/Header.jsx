import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout, selectCurrentUser } from "../../features/auth/authSlice";
import { toggleTheme, selectTheme } from "../../features/theme/themeSlice";
import { api } from "../../app/api";

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export default function Header({ title }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user     = useAppSelector(selectCurrentUser);
  const mode     = useAppSelector(selectTheme);

  function handleLogout() {
    dispatch(logout());
    dispatch(api.util.resetApiState());
    navigate("/login");
  }

  const displayName = user?.fullName || user?.email || "";
  const greeting = getGreeting();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card shrink-0 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-muted-foreground text-sm hidden sm:block">Panel</span>
        {title && title !== "Panel" && (
          <>
            <ChevronRight size={14} className="text-muted-foreground/50 hidden sm:block shrink-0" />
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {user && (
          <div className="hidden md:flex flex-col items-end mr-1">
            <span className="text-xs text-muted-foreground">{greeting}</span>
            <span className="text-sm font-medium leading-tight truncate max-w-[180px]">{displayName}</span>
          </div>
        )}
        {user && <Avatar name={displayName} />}

        {/* Language toggle */}
        {/* Dark mode toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title={mode === "dark" ? "Light mode" : "Dark mode"}
          aria-label={mode === "dark" ? "Light mode" : "Dark mode"}
        >
          {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "Good night,";
  if (h < 12) return "Good morning,";
  if (h < 18) return "Good afternoon,";
  return "Good evening,";
}
