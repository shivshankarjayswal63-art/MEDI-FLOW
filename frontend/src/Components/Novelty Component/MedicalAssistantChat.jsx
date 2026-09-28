import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { brand } from "../../theme/brand";
import { useTypewriter } from "../../hooks/useTypewriter";
import {
  sendMedicalAssistantMessage,
  bookMedicalAssistantSlot,
  fetchMedicalAssistantSession,
  clearMedicalAssistantSession,
} from "../../utils/medicalAssistantApi";
import { getMedicalQuestionSuggestions } from "../../utils/medicalChatSuggestions";
import { isBookingMessage } from "../../utils/bookingIntent";
import {
  loadLocalMedicalChat,
  saveLocalMedicalChat,
  clearLocalMedicalChat,
  sessionRowsToUiMessages,
} from "../../utils/medicalAssistantChatStorage";
import MedicalAssistantActionChips from "./MedicalAssistantActionChips";
import ReportUploadDialog from "../User Component/MedicalReports/ReportUploadDialog";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Welcome to **MEDI FLOW** assistant. Ask about symptoms, **summarize my health history**, upload a **lab report** (attach icon), or say **book appointment** — I remember your chat when you return.",
    animate: false,
  },
];

function toHistory(messages) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.fullContent || m.content }));
}

function renderMessageText(text) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Box component="span" key={i} sx={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </Box>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function AssistantMessageBody({ message, isLatestAssistant }) {
  const full = message.fullContent || message.content;
  const shouldAnimate = isLatestAssistant && message.animate;
  const { display, isTyping } = useTypewriter(full, shouldAnimate);

  return (
    <>
      <Typography
        variant="body2"
        component="div"
        sx={{
          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {renderMessageText(shouldAnimate ? display : full)}
        {isTyping && (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 6,
              height: 14,
              ml: 0.5,
              bgcolor: brand.success,
              animation: "blink 1s step-end infinite",
              "@keyframes blink": { "50%": { opacity: 0 } },
            }}
          />
        )}
      </Typography>
      {message.meta?.source && (
        <Chip
          size="small"
          label={message.meta.source === "nemotron" ? "AI · medical mode" : "Screening engine"}
          sx={{
            mt: 1,
            height: 22,
            fontSize: "0.65rem",
            bgcolor: alpha(brand.success, 0.12),
            color: brand.success,
          }}
        />
      )}
    </>
  );
}

export default function MedicalAssistantChat() {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [bookingState, setBookingState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const bottomRef = useRef(null);
  const autoSentRef = useRef(false);

  const trimmedInput = input.trim();
  const suggestions = useMemo(() => getMedicalQuestionSuggestions(input), [input]);
  const showSuggestions = !loading && trimmedInput.length >= 2;

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, booking]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadLocalMedicalChat();
      if (local?.messages?.length) {
        setMessages(local.messages);
        setBookingState(local.bookingState || null);
      }
      try {
        const session = await fetchMedicalAssistantSession();
        if (cancelled) return;
        if (session?.messages?.length) {
          setMessages(sessionRowsToUiMessages(session.messages, INITIAL_MESSAGES));
          setBookingState(session.bookingState || null);
        }
      } catch {
        /* offline */
      }
      setSessionReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    saveLocalMedicalChat({ messages, bookingState });
  }, [messages, bookingState, sessionReady]);

  const pushAssistant = (content, meta, actions = []) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content,
        fullContent: content,
        animate: true,
        meta,
        actions: actions || [],
      },
    ]);
  };

  const applyChatResponse = (data) => {
    const reply = data.reply || data.response || "Sorry, I could not generate a reply.";
    setUrgent(Boolean(data.urgent));
    if (data.bookingState !== undefined) {
      setBookingState(data.bookingState);
    }
    pushAssistant(reply, data, data.actions || []);
  };

  const sendMessage = async (text, options = {}) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const { selection = null, skipUserBubble = false, forceBooking = false } = options;
    const useForceBooking = forceBooking || isBookingMessage(trimmed) || Boolean(bookingState?.step);

    setError("");
    if (!skipUserBubble) {
      setMessages((prev) => [...prev.map((m) => ({ ...m, animate: false })), { role: "user", content: trimmed }]);
    }
    setInput("");
    setLoading(true);

    try {
      const historyBefore = toHistory(messages);
      const data = await sendMedicalAssistantMessage(trimmed, historyBefore, {
        bookingState,
        selection,
        forceBooking: useForceBooking,
      });
      applyChatResponse(data);
    } catch (err) {
      const isTimeout = err.name === "AbortError";
      setError(
        isTimeout
          ? "Request timed out. Try a shorter question."
          : err.message || "Could not reach the server."
      );
      pushAssistant(
        "Connection issue — please try again. You can also use **Symptom AI** from the menu.",
        { source: "rules" },
        []
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionReady || autoSentRef.current) return;
    const auto = location.state?.autoMessage;
    if (auto && typeof auto === "string") {
      autoSentRef.current = true;
      window.history.replaceState({}, document.title);
      sendMessage(auto, { forceBooking: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot navigation payload
  }, [sessionReady, location.state]);

  const handleBookingSelection = async (userLabel, selection) => {
    if (loading) return;
    setMessages((prev) => [...prev.map((m) => ({ ...m, animate: false })), { role: "user", content: userLabel }]);
    setLoading(true);
    setError("");
    try {
      const data = await sendMedicalAssistantMessage(userLabel, toHistory(messages), {
        bookingState,
        selection,
        forceBooking: true,
      });
      applyChatResponse(data);
    } catch (err) {
      setError(err.message || "Could not continue booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (action) => {
    if (booking) return;
    setBooking(true);
    setError("");
    setMessages((prev) => [...prev.map((m) => ({ ...m, animate: false })), { role: "user", content: "Confirm booking" }]);
    try {
      const result = await bookMedicalAssistantSlot({
        doctorId: action.doctorId,
        doctorName: action.doctorName,
        specialization: action.specialization,
        date: action.date,
        time: action.time,
        visitMode: action.visitMode,
      });
      setBookingState(null);
      pushAssistant(result.reply || "Appointment booked.", { source: "rules" }, []);
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const startBooking = () => sendMessage("book appointment", { forceBooking: true });

  const handleReportUploaded = (uploadResult) => {
    const fileName =
      uploadResult?.fileName ||
      uploadResult?.file_name ||
      "your report";
    const summary =
      uploadResult?.assistantSummary ||
      uploadResult?.reportSummary ||
      uploadResult?.report_summary ||
      "";
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, animate: false })),
      { role: "user", content: `Uploaded lab report: ${fileName}` },
      {
        role: "assistant",
        content: summary
          ? `**Report uploaded — AI summary**\n\n${summary}\n\nAsk **summarize my lab report** anytime or say **book appointment** for a matching specialist.`
          : `**Report uploaded:** ${fileName}. I will use it for doctor recommendations. Say **summarize my lab report** for details.`,
        fullContent: summary
          ? `**Report uploaded — AI summary**\n\n${summary}\n\nAsk **summarize my lab report** anytime or say **book appointment** for a matching specialist.`
          : `**Report uploaded:** ${fileName}. I will use it for doctor recommendations. Say **summarize my lab report** for details.`,
        animate: true,
        meta: { source: "rules" },
        actions: [],
      },
    ]);
  };

  const handleNewChat = async () => {
    setMessages(INITIAL_MESSAGES);
    setBookingState(null);
    setUrgent(false);
    setError("");
    clearLocalMedicalChat();
    try {
      await clearMedicalAssistantSession();
    } catch {
      /* ignore */
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!sessionReady) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 360,
          width: "100%",
        }}
      >
        <Stack alignItems="center" spacing={1}>
          <CircularProgress sx={{ color: brand.success }} />
          <Typography variant="body2" color="text.secondary">
            Loading medical assistant…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        mx: { xs: -1.5, sm: -2, md: -3 },
        minHeight: 420,
        flex: 1,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: { xs: 2, md: 2.5 },
          overflow: "hidden",
          border: `1px solid ${alpha(brand.primary, 0.12)}`,
          boxShadow: `0 8px 32px ${alpha(brand.primary, 0.08)}`,
          minHeight: 0,
          height: "100%",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.25, sm: 1.5 },
            background: `linear-gradient(135deg, ${brand.primary} 0%, #3d3f9e 50%, ${brand.success} 110%)`,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <LocalHospitalIcon />
              <Box>
                <Typography fontWeight={700} sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, lineHeight: 1.2 }}>
                  Medical assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Health Q&A · your records · book visits
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ display: { xs: "none", sm: "flex" } }}>
              <Button
                component={RouterLink}
                to="/symptom-analysis"
                size="small"
                sx={{ color: "#fff", borderColor: alpha("#fff", 0.5), fontSize: "0.7rem" }}
                variant="outlined"
              >
                Symptom AI
              </Button>
              <Button
                size="small"
                onClick={startBooking}
                sx={{ bgcolor: alpha("#fff", 0.2), color: "#fff", fontSize: "0.7rem" }}
              >
                Book
              </Button>
              <Button
                size="small"
                onClick={handleNewChat}
                sx={{ color: "#fff", borderColor: alpha("#fff", 0.35), fontSize: "0.65rem" }}
                variant="outlined"
              >
                New chat
              </Button>
            </Stack>
          </Stack>
        </Box>

        {urgent && (
          <Alert severity="error" sx={{ borderRadius: 0, py: 0.25, flexShrink: 0 }}>
            Urgent screening — seek emergency care if symptoms are severe.
          </Alert>
        )}
        {error && (
          <Alert severity="warning" sx={{ borderRadius: 0, py: 0.25, flexShrink: 0 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            bgcolor: alpha(brand.lightBg, 0.5),
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isLatestAssistant = !isUser && idx === lastAssistantIndex;
            return (
              <Box key={idx} sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", mb: 1.75 }}>
                <Stack
                  direction={isUser ? "row-reverse" : "row"}
                  spacing={1}
                  alignItems="flex-end"
                  sx={{ maxWidth: { xs: "98%", md: "85%" } }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isUser ? brand.primary : brand.success,
                      color: "#fff",
                    }}
                  >
                    {isUser ? <PersonOutlineIcon fontSize="small" /> : <SmartToyOutlinedIcon fontSize="small" />}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        bgcolor: isUser ? brand.primary : "#fff",
                        color: isUser ? "#fff" : "text.primary",
                        border: isUser ? "none" : `1px solid ${alpha(brand.primary, 0.08)}`,
                      }}
                    >
                      {isUser ? (
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {msg.content}
                        </Typography>
                      ) : (
                        <AssistantMessageBody message={msg} isLatestAssistant={isLatestAssistant} />
                      )}
                    </Paper>
                    {!isUser && (
                      <MedicalAssistantActionChips
                        actions={msg.actions}
                        onSelection={handleBookingSelection}
                        onConfirm={handleConfirmBooking}
                        disabled={loading || booking}
                      />
                    )}
                  </Box>
                </Stack>
              </Box>
            );
          })}
          {(loading || booking) && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 5, py: 0.5 }}>
              <CircularProgress size={18} sx={{ color: brand.success }} />
              <Typography variant="body2" color="text.secondary">
                {booking ? "Booking…" : "Analyzing…"}
              </Typography>
            </Stack>
          )}
          <div ref={bottomRef} />
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${alpha(brand.primary, 0.1)}`,
            bgcolor: "#fff",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
          }}
        >
          {showSuggestions && (
            <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {suggestions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => sendMessage(s)}
                  variant="outlined"
                  sx={{
                    height: "auto",
                    maxWidth: "100%",
                    py: 0.4,
                    "& .MuiChip-label": { whiteSpace: "normal", fontSize: "0.75rem" },
                  }}
                />
              ))}
            </Box>
          )}

          <Stack direction="row" spacing={1} alignItems="flex-end">
            <Tooltip title="Upload lab report (PDF/image) for AI summary">
              <span>
                <IconButton
                  onClick={() => setUploadOpen(true)}
                  disabled={loading || booking}
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    border: `1px solid ${alpha(brand.primary, 0.2)}`,
                  }}
                >
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <TextField
              fullWidth
              multiline
              maxRows={isMobile ? 3 : 4}
              placeholder="Health question or type “book appointment”…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || booking}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
            />
            <IconButton
              onClick={() => sendMessage(input)}
              disabled={loading || booking || !trimmedInput}
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                bgcolor: brand.success,
                color: "#fff",
                "&:hover": { bgcolor: "#259a84" },
                "&.Mui-disabled": { bgcolor: alpha(brand.gray, 0.3) },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {uploadOpen && (
        <ReportUploadDialog
          onClose={() => setUploadOpen(false)}
          onSuccess={(result) => {
            setUploadOpen(false);
            handleReportUploaded(result);
          }}
        />
      )}
    </Box>
  );
}
