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
    const patientNotes = formData.get("patientNotes") || formData.get("notes") || "";
    const fileBase64 = await fileToBase64(file);

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
