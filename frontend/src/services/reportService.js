
import axios from "axios";
import { apiUrl } from "../utils/apiBase";

const reportsBase = () => apiUrl("/api/reports");

export const getMedicalReports = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(reportsBase(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const uploadMedicalReport = async (formData) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${reportsBase()}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteMedicalReport = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${reportsBase()}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
