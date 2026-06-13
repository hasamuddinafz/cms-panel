import { useAppSelector } from "./hooks";
import { selectPermissions } from "../features/auth/authSlice";

/**
 * Returns true if the current user has ALL of the given permission keys.
 * Usage:  const canDelete = usePermission("pages.delete");
 *         const canManage = usePermission("pages.create", "pages.edit");
 */
export function usePermission(...keys) {
  const permissions = useAppSelector(selectPermissions);
  return keys.every((k) => permissions.includes(k));
}
