import axios from "axios";
import { apiUrl } from "../utils/apiBase";
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
  throw wrapped;
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

export const uploadMedicalReport = async (formData) => {
  try {
    const res = await axios.post(`${reportsBase()}/upload`, formData, {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
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
