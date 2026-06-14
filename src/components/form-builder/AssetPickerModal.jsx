import { useState } from "react";
import { X, Search, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetFileListQuery, useUploadFileMutation } from "../../features/media/mediaApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AssetPickerModal({ open, onClose, assetType, onSelect }) {
  const { t } = useTranslation();
  const [search, setSearch]   = useState("");
  const [page,   setPage]     = useState(1);
  const fileType = assetType === "image" ? "Image" : assetType === "video" ? "Video" : undefined;

  const { data, isLoading } = useGetFileListQuery(
    { search, page, pageSize: 20, fileType },
    { skip: !open }
  );

  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadFile(fd).unwrap();
    onSelect(result);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">{t("common.selectFile")}</h2>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild={false} disabled={isUploading}>
                <Upload size={13} className="mr-1.5" />
                {isUploading ? t("common.uploading") : t("common.upload")}
              </Button>
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder={t("common.searchFiles")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground py-8">{t("common.loading")}</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {(data?.items ?? []).map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="group relative rounded-lg border-2 border-transparent hover:border-primary overflow-hidden aspect-square bg-muted text-left"
                  onClick={() => onSelect(asset)}
                >
                  {asset.thumbnailUrl ? (
                    <img
                      src={`${BASE_URL}${asset.thumbnailUrl}`}
                      alt={asset.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground p-2 text-center break-all">
                      {asset.fileName}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2 border-t text-sm text-muted-foreground">
          <span>{t("common.totalFiles")} {data?.totalCount ?? 0}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
            <Button variant="outline" size="sm" disabled={!data?.hasNextPage} onClick={() => setPage(p => p + 1)}>›</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
