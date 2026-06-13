import { Navigate, Outlet } from "react-router-dom";
import { usePermission } from "../../app/usePermission";

/**
 * Route-level permission guard.
 * Usage in router: <Route element={<RequirePermission permission="roles.manage" />}>
 */
export default function RequirePermission({ permission }) {
  const allowed = usePermission(permission);
  if (!allowed) return <Navigate to="/" replace />;
  return <Outlet />;
}
