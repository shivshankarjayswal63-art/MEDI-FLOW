const getApiBase = () => import.meta.env.VITE_API_URL || "";

/**
 * @param {string} message
 * @param {{ role: string, content: string }[]} history
 */
export async function sendMedicalAssistantMessage(message, history = []) {
  const api = getApiBase();
  if (!api) {
    throw new Error("VITE_API_URL is not configured");
  }

  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${api}/api/medical-assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history }),
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

export async function bookMedicalAssistantSlot({ doctorId, doctorName, specialization, date, time }) {
  const api = getApiBase();
  if (!api) throw new Error("VITE_API_URL is not configured");

  const token = localStorage.getItem("token");
  if (!token) throw new Error("Sign in to book an appointment.");

  const res = await fetch(`${api}/api/medical-assistant/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ doctorId, doctorName, specialization, date, time }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Booking failed (${res.status})`);
  }
  return res.json();
}
