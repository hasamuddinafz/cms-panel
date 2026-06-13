import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { Trash2, Upload, Image, FileText, Film, File } from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import DataTable from "../components/data-table/DataTable";
import { useDataTable } from "../components/data-table/useDataTable";
import { useExport } from "../components/data-table/useExport";
import { Button } from "../components/ui/button";
import {
  useGetFileListQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} from "../features/media/mediaApi";
import { usePermission } from "../app/usePermission";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const TYPE_ICONS = { Image, Document: FileText, Video: Film };
const FILE_TYPES = ["", "Image", "Document", "Video", "Other"];

export default function MediaPage() {
  const dt          = useDataTable();
  const fileInputRef = useRef(null);

  const { data, isLoading } = useGetFileListQuery({
    search:   dt.queryParams.search,
    page:     dt.queryParams.page,
    pageSize: dt.queryParams.pageSize,
    fileType: dt.queryParams.filters.fileType,
  });

  const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();
  const [deleteFile]                           = useDeleteFileMutation();

  const canUpload = usePermission("media.upload");
  const canDelete = usePermission("media.delete");

  const { onExportCsv, onExportExcel } = useExport(
    "/api/admin/files/export",
    { search: dt.queryParams.search, fileType: dt.queryParams.filters.fileType },
    "medya"
  );

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await uploadFile(fd).unwrap();
      toast.success("Dosya yüklendi.");
    } catch {
      toast.error("Yükleme başarısız.");
    }
    e.target.value = "";
  }

  async function handleDelete(id) {
    if (!window.confirm("Dosya kalıcı olarak silinecek. Emin misiniz?")) return;
    try {
      await deleteFile(id).unwrap();
      toast.success("Silindi.");
    } catch {
      toast.error("Silme işlemi başarısız.");
    }
  }

  const columns = useMemo(
    () => [
      {
        id: "preview",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const { thumbnailUrl, fileType, fileName } = row.original;
          const Icon = TYPE_ICONS[fileType] ?? File;
          return thumbnailUrl ? (
            <img
              src={`${BASE_URL}${thumbnailUrl}`}
              alt={fileName}
              className="h-10 w-10 object-cover rounded"
            />
          ) : (
            <Icon size={24} className="text-muted-foreground" />
          );
        },
      },
      {
        id: "fileName",
        header: "Dosya Adı",
        accessorKey: "fileName",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.fileName}</span>
        ),
      },
      {
        id: "fileType",
        header: "Tip",
        accessorKey: "fileType",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.fileType}</span>
        ),
      },
      {
        id: "sizeBytes",
        header: "Boyut",
        accessorKey: "sizeBytes",
        cell: ({ row }) => formatBytes(row.original.sizeBytes),
      },
      {
        id: "createdAt",
        header: "Yüklendi",
        accessorKey: "createdAt",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("tr-TR"),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) =>
          canDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 size={13} />
            </Button>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canDelete]
  );

  const filterSlot = (
    <select
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      value={dt.queryParams.filters.fileType ?? ""}
      onChange={(e) => dt.onFilterChange("fileType", e.target.value || undefined)}
    >
      {FILE_TYPES.map((t) => (
        <option key={t} value={t}>{t || "Tüm tipler"}</option>
      ))}
    </select>
  );

  return (
    <>
      <PanelHelmet title="Medya" />

      <div className="flex justify-end mb-4">
        {canUpload && (
          <>
            <Button
              variant="default"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              <Upload size={14} />
              {uploading ? "Yükleniyor…" : "Dosya Yükle"}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
          </>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        isLoading={isLoading}
        page={dt.page}
        setPage={dt.setPage}
        pageSize={dt.pageSize}
        setPageSize={dt.setPageSize}
        search={dt.search}
        onSearchChange={dt.setSearch}
        sortBy={dt.sortBy}
        sortDir={dt.sortDir}
        onSortChange={dt.onSortChange}
        filterSlot={filterSlot}
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
      />
    </>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
