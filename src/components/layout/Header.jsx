import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout, selectCurrentUser } from "../../features/auth/authSlice";
import { Button } from "../ui/button";
import { api } from "../../app/api";

export default function Header({ title }) {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const user      = useAppSelector(selectCurrentUser);

  function handleLogout() {
    dispatch(logout());
    dispatch(api.util.resetApiState());
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-background shrink-0">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        {user && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User size={14} />
            {user.fullName || user.email}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Çıkış">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
