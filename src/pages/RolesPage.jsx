import { useMemo, useState, useEffect } from "react";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  useGetRoleListQuery,
  useGetAllPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleByIdQuery,
} from "../features/roles/rolesApi";
import { getErrorMessage } from "../lib/errors";

export default function RolesPage() {
  const dt = useDataTable();
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useGetRoleListQuery({
    search:   dt.queryParams.search,
    page:     dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
  });

  const [deleteRole] = useDeleteRoleMutation();
  const confirm = useConfirm();

  async function handleDelete(id, isSystem) {
    if (isSystem) return toast.error("System roles cannot be deleted.");
    if (!await confirm("This role will be deleted. Are you sure?")) return;
    try {
      await deleteRole(id).unwrap();
      toast.success("Role deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed."));
    }
  }

  const columns = useMemo(() => [
    {
      id: "name",
      header: "Role Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="flex items-center gap-2 font-medium text-sm">
          <Shield size={14} className="text-muted-foreground" />
          {row.original.name}
          {row.original.isSystemRole && (
            <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-semibold">
              SYSTEM
            </span>
          )}
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description ?? "—"}</span>
      ),
    },
    {
      id: "permissionCount",
      header: "Permission Count",
      accessorKey: "permissionCount",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.permissionCount}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost" size="icon"
            onClick={() => setModal({ mode: "edit", roleId: row.original.id })}
          >
            <Pencil size={13} />
          </Button>
          {!row.original.isSystemRole && (
            <Button
              variant="ghost" size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(row.original.id, row.original.isSystemRole)}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
    },
  ], []); // eslint-disable-line

  return (
    <>
      <PanelHelmet title="Roles & Permissions" />

      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ mode: "create" })}>
          <Plus size={14} /> New Role
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
      />

      {modal && (
        <RoleModal
          mode={modal.mode}
          roleId={modal.roleId}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function RoleModal({ mode, roleId, onClose }) {
  const { data: permGroups = [] } = useGetAllPermissionsQuery();
  const { data: existingRole }    = useGetRoleByIdQuery(roleId, { skip: !roleId });

  const [name,        setName]        = useState(existingRole?.name ?? "");
  const [description, setDescription] = useState(existingRole?.description ?? "");
  const [checked,     setChecked]     = useState(() => new Set(existingRole?.permissionKeys ?? []));

  useSyncRole(existingRole, setName, setDescription, setChecked);

  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  function toggle(key) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll(keys, value) {
    setChecked((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (value ? next.add(k) : next.delete(k)));
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const permissionIds = permGroups
      .flatMap((g) => g.permissions)
      .filter((p) => checked.has(p.key))
      .map((p) => p.id);

    try {
      if (mode === "create") {
        await createRole({ name, description, permissionIds }).unwrap();
        toast.success("Role created.");
      } else {
        await updateRole({ id: roleId, name, description, permissionIds }).unwrap();
        toast.success("Role updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "An error occurred."));
    }
  }

  const isBusy = creating || updating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-background rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 id="role-modal-title" className="font-semibold">{mode === "create" ? "New Role" : "Edit Role"}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-5 py-4 border-b space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role Name *</Label>
                <Input placeholder="e.g. Content Editor" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="Short description of this role" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Permissions</p>
            {permGroups.map((group) => {
              const keys        = group.permissions.map((p) => p.key);
              const allChecked  = keys.every((k) => checked.has(k));
              const someChecked = keys.some((k) => checked.has(k));

              return (
                <div key={group.module} className="rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
                    <span className="text-xs font-semibold">{group.module}</span>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                        onChange={(e) => toggleAll(keys, e.target.checked)}
                      />
                      All
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
                    {group.permissions.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 px-3 py-2 bg-background text-sm cursor-pointer hover:bg-muted/30 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked.has(perm.key)}
                          onChange={() => toggle(perm.key)}
                          className="rounded"
                        />
                        <span className="text-xs">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function useSyncRole(role, setName, setDescription, setChecked) {
  useEffect(() => {
    if (!role) return;
    setName(role.name ?? "");
    setDescription(role.description ?? "");
    setChecked(new Set(role.permissionKeys ?? []));
  }, [role]); // eslint-disable-line
}
