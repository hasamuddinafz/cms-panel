import { useAppSelector } from "../../app/hooks";
import { selectAccessToken } from "../../features/auth/authSlice";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Returns CSV and Excel export handlers that call the backend /export endpoint
 * with the same filter params used by the current list view.
 *
 * @param {string} exportPath  e.g. "/api/admin/pages/export"
 * @param {object} params      current filter/search/sort params (no pagination)
 * @param {string} filename    download filename without extension
 */
export function useExport(exportPath, params, filename) {
  const token = useAppSelector(selectAccessToken);

  async function download(format) {
    const qs = new URLSearchParams({ ...params, format }).toString();
    const url = `${BASE_URL}${exportPath}?${qs}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = href;
    a.download = `${filename}.${format === "excel" ? "xlsx" : "csv"}`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return {
    onExportCsv:   () => download("csv"),
    onExportExcel: () => download("excel"),
  };
}
