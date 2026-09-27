import { apiUrl } from "./apiBase";

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

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          "Medical assistant API not found. Redeploy the BACKEND on Vercel (latest main) and check VITE_API_URL."
        );
      }
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Server responded with ${res.status}`);
    }

    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
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
