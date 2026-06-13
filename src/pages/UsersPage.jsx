import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserCog, X, Check } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { Button } from "../components/ui/button";
import { useGetUserListQuery, useAssignRolesMutation } from "../features/users/usersApi";
import { useGetRoleListQuery } from "../features/roles/rolesApi";

export default function UsersPage() {
  const dt = useDataTable();
  const [assignModal, setAssignModal] = useState(null); // { userId, currentRoleIds }

  const { data, isLoading } = useGetUserListQuery({
    search:   dt.queryParams.search,
    page:     dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
  });

  const { onExportCsv, onExportExcel } = useExport(
    "/api/admin/users/export",
    { search: dt.queryParams.search },
    "kullanicilar"
  );

  const columns = useMemo(() => [
    {
      id: "email",
      header: "E-posta",
      accessorKey: "email",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.email}</span>,
    },
    {
      id: "fullName",
      header: "Ad Soyad",
      accessorKey: "fullName",
      cell: ({ row }) => <span className="text-sm">{row.original.fullName || "—"}</span>,
    },
    {
      id: "roles",
      header: "Roller",
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
      header: "Aktif",
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
      header: "Son Giriş",
      accessorKey: "lastLoginAt",
      cell: ({ row }) =>
        row.original.lastLoginAt
          ? new Date(row.original.lastLoginAt).toLocaleString("tr-TR")
          : "—",
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost" size="icon"
          title="Rol Ata"
          onClick={() => setAssignModal({
            userId: row.original.id,
            currentRoleIds: [], // will be populated in modal from API
            userEmail: row.original.email,
          })}
        >
          <UserCog size={14} />
        </Button>
      ),
    },
  ], []);

  return (
    <>
      <PanelHelmet title="Kullanıcılar" />
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
      toast.success("Roller güncellendi.");
      onClose();
    } catch {
      toast.error("Güncelleme başarısız.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Rol Ata</h2>
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
                <span className="text-[10px] bg-primary/10 text-primary rounded px-1 ml-auto">SİSTEM</span>
              )}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
