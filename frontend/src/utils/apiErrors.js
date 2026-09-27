/**
 * User-safe API error text. Technical details go to the console only.
 */
export function getUserFacingApiError(error, fallback = "Something went wrong. Please try again in a moment.") {
  if (error?.response?.data?.message && typeof error.response.data.message === "string") {
    const serverMsg = error.response.data.message;
    if (!looksTechnical(serverMsg)) return serverMsg;
  }

  if (error?.response?.status === 401) {
    return "Your session expired or your email or password is incorrect. Please try again.";
  }
  if (error?.response?.status === 403) {
    return error.response?.data?.message || "You do not have permission to do that.";
  }
  if (error?.response?.status === 503) {
    return "Our services are temporarily unavailable. Please try again shortly.";
  }
  if (error?.response?.status >= 500) {
    return "Our server is having trouble right now. Please try again in a few minutes.";
  }

  const isNetwork =
    error?.message === "Network Error" ||
    error?.name === "TypeError" ||
    /failed to fetch/i.test(String(error?.message || ""));

  if (isNetwork) {
    console.warn("[MEDI FLOW] Network/API error:", error);
    return "We could not connect to MEDI FLOW right now. Check your internet connection and try again. If the problem continues, try again later or contact support.";
  }

  if (error?.name === "AbortError") {
    return "The request took too long. Please try again.";
  }

  const raw = error?.message;
  if (raw && !looksTechnical(raw)) return raw;

  console.warn("[MEDI FLOW] API error:", error);
  return fallback;
}

function looksTechnical(message) {
  const m = String(message).toLowerCase();
  return (
    m.includes("vite_") ||
    m.includes("vercel") ||
    m.includes("env") ||
    m.includes("cors") ||
    m.includes("medi-flow-api") ||
    m.includes("supabase") ||
    m.includes("jwt_secret")
  );
}
