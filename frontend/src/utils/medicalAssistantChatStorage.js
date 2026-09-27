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
    const parsed = JSON.parse(raw);
    const messages = sanitizeMessages(parsed?.messages);
    if (!messages) return null;
    return { ...parsed, messages };
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

function sanitizeMessages(list) {
  if (!Array.isArray(list)) return null;
  const out = list
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && (m.content || m.fullContent))
    .map((m) => ({
      role: m.role,
      content: String(m.fullContent || m.content || ""),
      fullContent: String(m.fullContent || m.content || ""),
      animate: false,
      meta: m.meta || {},
      actions: Array.isArray(m.actions) ? m.actions : m.meta?.actions || [],
    }));
  return out.length ? out : null;
}

export function sessionRowsToUiMessages(rows, fallbackWelcome) {
  const fromRows = sanitizeMessages(
    rows?.map((m) => ({
      role: m.role,
      content: m.content,
      meta: m.meta,
      actions: m.meta?.actions || m.actions,
    }))
  );
  if (fromRows) return fromRows;
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
