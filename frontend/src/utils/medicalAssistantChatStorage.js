const STORAGE_KEY = "medi_flow_medical_assistant_v1";

function storageKey() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId") || localStorage.getItem("user_id") || "guest";
  return `${STORAGE_KEY}_${userId}_${token ? "auth" : "anon"}`;
}

export function loadLocalMedicalChat() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalMedicalChat({ messages, bookingState }) {
  try {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({
        messages,
        bookingState,
        savedAt: Date.now(),
      })
    );
  } catch {
    /* quota */
  }
}

export function clearLocalMedicalChat() {
  try {
    localStorage.removeItem(storageKey());
  } catch {
    /* ignore */
  }
}

export function sessionRowsToUiMessages(rows, fallbackWelcome) {
  if (!rows?.length) return fallbackWelcome;
  return rows.map((m) => ({
    role: m.role,
    content: m.content,
    fullContent: m.content,
    animate: false,
    meta: m.meta || {},
    actions: m.meta?.actions || m.actions || [],
  }));
}
