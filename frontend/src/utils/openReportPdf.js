import axios from "axios";
import { apiUrl } from "./apiBase";

export async function openReportPdf(report) {
  const id = report?._id || report?.id;
  const token = localStorage.getItem("token");
  if (!id || !token) {
    throw new Error("Not signed in or missing report id");
  }

  const res = await axios.get(apiUrl(`/api/reports/${id}/download`), {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
    validateStatus: () => true,
  });

  if (res.status !== 200) {
    let message = `Could not open report (${res.status})`;
    try {
      const text = await res.data.text();
      const json = JSON.parse(text);
      if (json.message) message = json.message;
    } catch {
      /* blob was not JSON */
    }
    throw new Error(message);
  }

  const mime = report.fileType || report.file_type || res.headers["content-type"] || "application/pdf";
  const url = URL.createObjectURL(new Blob([res.data], { type: mime }));
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
