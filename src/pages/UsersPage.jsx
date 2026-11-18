import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserCog, X, Check, Plus, Eye, EyeOff } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useGetUserListQuery, useCreateUserMutation, useAssignRolesMutation } from "../features/users/usersApi";
import { useGetRoleListQuery } from "../features/roles/rolesApi";
import { getErrorMessage } from "../lib/errors";

export default function UsersPage() {
  const dt = useDataTable();
  const [assignModal, setAssignModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);

  const { data, isLoading } = useGetUserListQuery({
    search:   dt.queryParams.search,
    page:     dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
  });

  const { onExportCsv, onExportExcel } = useExport(
    "/api/admin/users/export",
    { search: dt.queryParams.search },
    "users"
  );

  const columns = useMemo(() => [
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.email}</span>,
    },
    {
      id: "fullName",
      header: "Full Name",
      accessorKey: "fullName",
      cell: ({ row }) => <span className="text-sm">{row.original.fullName || "—"}</span>,
    },
    {
      id: "roles",
      header: "Roles",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roleNames?.map((r) => (
            <span key={r} className="text-xs bg-secondary text-secondary-foreground rounded px-1.5 py-0.5">
              {r}
            </span>
          )) ?? "—"}
        </div>
      ),
    },
    {
      id: "isActive",
      header: "Active",
      accessorKey: "isActive",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Check size={14} className="text-green-600" />
        ) : (
          <X size={14} className="text-muted-foreground" />
        ),
    },
    {
      id: "lastLoginAt",
      header: "Last Login",
      accessorKey: "lastLoginAt",
      cell: ({ row }) =>
        row.original.lastLoginAt
          ? new Date(row.original.lastLoginAt).toLocaleString("en-US")
          : "—",
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost" size="icon"
          title="Assign Roles"
          onClick={() => setAssignModal({
            userId: row.original.id,
            currentRoleIds: [],
            userEmail: row.original.email,
          })}
        >
          <UserCog size={14} />
        </Button>
      ),
    },
  ], []); // eslint-disable-line

  return (
    <>
      <PanelHelmet title="Users" />
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1.5" onClick={() => setCreateModal(true)}>
          <Plus size={14} /> New User
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        isLoading={isLoading}
        page={dt.page} setPage={dt.setPage}
        pageSize={dt.pageSize} setPageSize={dt.setPageSize}
        search={dt.search} onSearchChange={dt.setSearch}
        sortBy={dt.sortBy} sortDir={dt.sortDir} onSortChange={dt.onSortChange}
        onExportCsv={onExportCsv} onExportExcel={onExportExcel}
      />
      {createModal && <CreateUserModal onClose={() => setCreateModal(false)} />}
      {assignModal && (
        <AssignRolesModal
          userId={assignModal.userId}
          userEmail={assignModal.userEmail}
          onClose={() => setAssignModal(null)}
        />
      )}
    </>
  );
}

function AssignRolesModal({ userId, userEmail, onClose }) {
  const { data: rolesData }     = useGetRoleListQuery({ pageSize: 100 });
  const [assignRoles, { isLoading }] = useAssignRolesMutation();
  const [selected, setSelected] = useState(new Set());

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    try {
      await assignRoles({ userId, roleIds: [...selected] }).unwrap();
      toast.success("Roles updated.");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed."));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Assign Roles</h2>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
          {(rolesData?.items ?? []).map((role) => (
            <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded px-2 py-1.5">
              <input
                type="checkbox"
                checked={selected.has(role.id)}
                onChange={() => toggle(role.id)}
                className="rounded"
              />
              <span className="text-sm">{role.name}</span>
              {role.isSystemRole && (
                <span className="text-[10px] bg-primary/10 text-primary rounded px-1 ml-auto">SYSTEM</span>
              )}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", isActive: true });
  const [showPw, setShowPw] = useState(false);
  const [createUser, { isLoading }] = useCreateUserMutation();

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createUser(form).unwrap();
      toast.success("User created.");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "An error occurred."));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">New User</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}><X size={16} /></Button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input placeholder="John Doe" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" placeholder="john@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPw((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded" />
            User active
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
