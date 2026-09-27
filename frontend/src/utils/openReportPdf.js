import axios from "axios";

export async function openReportPdf(report) {
  const id = report?._id || report?.id;
  const token = localStorage.getItem("token");
  if (!id || !token) {
    throw new Error("Not signed in or missing report id");
  }
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/reports/${id}/download`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );
  const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
