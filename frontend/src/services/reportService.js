import axios from "axios";
import { apiUrl, getMaxReportUploadBytes } from "../utils/apiBase";
import { getUserFacingApiError } from "../utils/apiErrors";

const reportsBase = () => apiUrl("/api/reports");

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function wrapReportError(err, fallback) {
  const message = getUserFacingApiError(err, fallback);
  const wrapped = new Error(message);
  wrapped.cause = err;
  wrapped.response = err.response;
  throw wrapped;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file"));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export const getMedicalReports = async () => {
  try {
    const res = await axios.get(reportsBase(), {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    wrapReportError(err, "Could not load lab reports. Sign in as a patient and try again.");
  }
};

/**
 * Upload via JSON base64 (reliable on Vercel serverless).
 * @param {FormData} formData — must contain `report` File and optional `patientNotes`
 */
export const uploadMedicalReport = async (formData) => {
  try {
    const file = formData.get("report");
    if (!file || typeof file === "string") {
      throw new Error("No file selected.");
    }
    const maxBytes = getMaxReportUploadBytes();
    if (file.size > maxBytes) {
      const mb = Math.round(maxBytes / (1024 * 1024));
      throw new Error(`File is too large. Use a PDF or image under ${mb} MB.`);
    }

    // Choose upload strategy:
    // - On Vercel same-origin (no external API base) prefer JSON/base64 (`/upload-base64`).
    // - If the deployed API does not have `/upload-base64` yet, fall back to `/upload`.
    // - Otherwise use multipart `/upload`. If multipart fails, fallback to base64 when file size permits.
    const base = apiUrl("");
    const useBase64ByDefault = !base; // empty base => same-origin (Vercel)

    const postMultipart = () =>
      axios.post(`${reportsBase()}/upload`, formData, {
        headers: {
          ...authHeaders(),
        },
        maxBodyLength: 50 * 1024 * 1024,
        maxContentLength: 50 * 1024 * 1024,
      });

    if (useBase64ByDefault) {
      const patientNotes = formData.get("patientNotes") || formData.get("notes") || "";
      const fileBase64 = await fileToBase64(file);
      try {
        const res = await axios.post(
          `${reportsBase()}/upload-base64`,
          {
            fileName: file.name,
            fileType: file.type || "application/pdf",
            fileBase64,
            patientNotes: String(patientNotes || "").trim(),
          },
          {
            headers: {
              ...authHeaders(),
              "Content-Type": "application/json",
            },
            maxBodyLength: 14 * 1024 * 1024,
            maxContentLength: 14 * 1024 * 1024,
          }
        );
        return res.data;
      } catch (err) {
        // Older API deployments still expose multipart `/upload`. Retry there
        // only when the base64 route itself is missing, not for upload errors.
        if (err?.response?.status !== 404) throw err;
        const fallbackRes = await postMultipart();
        return fallbackRes.data;
      }
    }

    // Try multipart upload first
    try {
      const res = await postMultipart();
      return res.data;
    } catch (err) {
      // If multipart failed and file is within base64 limit, try base64 fallback
      const fallbackMax = getMaxReportUploadBytes();
      if (file.size <= fallbackMax) {
        try {
          const patientNotes = formData.get("patientNotes") || formData.get("notes") || "";
          const fileBase64 = await fileToBase64(file);
          const res2 = await axios.post(
            `${reportsBase()}/upload-base64`,
            {
              fileName: file.name,
              fileType: file.type || "application/pdf",
              fileBase64,
              patientNotes: String(patientNotes || "").trim(),
            },
            {
              headers: { ...authHeaders(), "Content-Type": "application/json" },
              maxBodyLength: 14 * 1024 * 1024,
              maxContentLength: 14 * 1024 * 1024,
            }
          );
          return res2.data;
        } catch (err2) {
          throw err2;
        }
      }
      throw err;
    }
  } catch (err) {
    wrapReportError(err, "Upload failed. Use PDF/JPEG/PNG under 10MB.");
  }
};

export const deleteMedicalReport = async (id) => {
  try {
    const res = await axios.delete(`${reportsBase()}/${id}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    wrapReportError(err, "Could not delete this report.");
  }
};
