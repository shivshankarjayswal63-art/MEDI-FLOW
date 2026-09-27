import axios from "axios";
import { apiUrl } from "./apiBase";

/** Normalize API payloads (array, or { doctors }, or invalid HTML/string) to a doctor list. */
export function normalizeDoctorsList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.doctors)) return payload.doctors;
    if (Array.isArray(payload.data)) return payload.data;
  }
  return [];
}

export async function fetchPublicDoctors() {
  const res = await axios.get(apiUrl("/api/doctor/public"), {
    headers: { Accept: "application/json" },
    validateStatus: (status) => status >= 200 && status < 300,
  });
  const list = normalizeDoctorsList(res.data);
  if (!list.length && res.data && typeof res.data === "string" && res.data.trim().startsWith("<")) {
    throw new Error("Invalid doctor list response");
  }
  return list;
}
