import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/authSlice";

/** Redirects unauthenticated users to /login. */
export default function RequireAuth() {
  const isAuth   = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
