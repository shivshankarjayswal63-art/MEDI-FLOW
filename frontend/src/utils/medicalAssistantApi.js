import { apiUrl } from "./apiBase";
import { getUserFacingApiError } from "./apiErrors";

/**
 * @param {string} message
 * @param {{ role: string, content: string }[]} history
 */
export async function fetchMedicalAssistantSession() {
  const token = localStorage.getItem("token");
  if (!token) return { messages: [], bookingState: null };

  const res = await fetch(apiUrl("/api/medical-assistant/session"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { messages: [], bookingState: null };
  return res.json();
}

export async function clearMedicalAssistantSession() {
  const token = localStorage.getItem("token");
  if (!token) return;
  await fetch(apiUrl("/api/medical-assistant/session"), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendMedicalAssistantMessage(
  message,
  history = [],
  { bookingState = null, selection = null, forceBooking = false } = {}
) {
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(apiUrl("/api/medical-assistant/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history, bookingState, selection, forceBooking }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const err = new Error("Invalid API response");
      err.response = { status: res.status };
      throw err;
    }

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || data.error || "Request failed");
      err.response = { status: res.status, data };
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const friendly = getUserFacingApiError(err);
    const wrapped = new Error(friendly);
    wrapped.cause = err;
    throw wrapped;
  }
}

export async function bookMedicalAssistantSlot({ doctorId, doctorName, specialization, date, time, visitMode }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Sign in to book an appointment.");

  const res = await fetch(apiUrl("/api/medical-assistant/book"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ doctorId, doctorName, specialization, date, time, visitMode }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Booking failed (${res.status})`);
  }
  return res.json();
}
