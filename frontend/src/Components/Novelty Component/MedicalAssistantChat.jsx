import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { brand } from "../../theme/brand";
import { useTypewriter } from "../../hooks/useTypewriter";
import { sendMedicalAssistantMessage, bookMedicalAssistantSlot } from "../../utils/medicalAssistantApi";
import { getMedicalQuestionSuggestions } from "../../utils/medicalChatSuggestions";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Hello! I answer **health questions only**. When signed in, I can use **your health record** and help **book appointments**. What would you like to know?",
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [bookingState, setBookingState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

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

    const { selection = null, skipUserBubble = false } = options;

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

  const handleBookingSelection = async (userLabel, selection) => {
    if (loading) return;
    setMessages((prev) => [...prev.map((m) => ({ ...m, animate: false })), { role: "user", content: userLabel }]);
    setLoading(true);
    setError("");
    try {
      const data = await sendMedicalAssistantMessage(userLabel, toHistory(messages), {
        bookingState,
        selection,
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

  const renderMessageActions = (msg) => {
    if (!msg.actions?.length) return null;

    return (
      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {msg.actions.flatMap((a) => {
          if (a.type === "pick_doctor") {
            return (a.doctors || []).map((d) => (
              <Chip
                key={`doc-${d.doctorId}`}
                label={d.doctorName}
                onClick={() =>
                  handleBookingSelection(`Doctor: ${d.doctorName}`, {
                    kind: "doctor",
                    doctorId: d.doctorId,
                    doctorName: d.doctorName,
                  })
                }
                disabled={loading || booking}
                color="primary"
                variant="outlined"
                sx={{ height: "auto", py: 0.5, "& .MuiChip-label": { whiteSpace: "normal" } }}
              />
            ));
          }
          if (a.type === "pick_date") {
            return (a.dates || []).map((d) => (
              <Chip
                key={`date-${a.doctorId}-${d.date}`}
                label={d.label || d.date}
                onClick={() =>
                  handleBookingSelection(`Date: ${d.label || d.date}`, {
                    kind: "date",
                    doctorId: a.doctorId,
                    date: d.date,
                  })
                }
                disabled={loading || booking}
                color="primary"
                variant="outlined"
              />
            ));
          }
          if (a.type === "pick_time") {
            return (a.times || []).map((t) => (
              <Chip
                key={`time-${a.date}-${t.time}`}
                label={t.label || t.time}
                onClick={() =>
                  handleBookingSelection(`Time: ${t.time}`, {
                    kind: "time",
                    doctorId: a.doctorId,
                    date: a.date,
                    time: t.time,
                  })
                }
                disabled={loading || booking}
                color="primary"
                variant="outlined"
              />
            ));
          }
          if (a.type === "pick_visit_mode") {
            return (a.modes || []).map((m) => (
              <Chip
                key={`mode-${m.mode}`}
                label={m.label}
                onClick={() =>
                  handleBookingSelection(m.label, {
                    kind: "visit_mode",
                    doctorId: a.doctorId,
                    visitMode: m.mode,
                  })
                }
                disabled={loading || booking}
                color="secondary"
                variant="outlined"
              />
            ));
          }
          if (a.type === "confirm_booking") {
            return (
              <Chip
                key="confirm-book"
                label="Confirm booking"
                onClick={() => handleConfirmBooking(a)}
                disabled={booking}
                color="success"
                sx={{ fontWeight: 700 }}
              />
            );
          }
          if (a.type === "pick_slot") {
            return (a.slots || []).map((slot) => (
              <Chip
                key={`${a.doctorId}-${slot.date}-${slot.time}`}
                label={slot.label || `${slot.date} ${slot.time}`}
                onClick={() =>
                  handleBookingSelection(`Book ${slot.label}`, {
                    kind: "time",
                    doctorId: a.doctorId,
                    date: slot.date,
                    time: slot.time,
                  })
                }
                disabled={loading || booking}
                variant="outlined"
              />
            ));
          }
          return [];
        })}
      </Box>
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        mx: { xs: -1.5, sm: -2, md: -3 },
        height: { xs: "calc(100dvh - 56px - 24px)", md: "calc(100dvh - 64px - 48px)" },
        minHeight: 420,
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
                component={RouterLink}
                to="/Book-Appointment"
                size="small"
                sx={{ bgcolor: alpha("#fff", 0.2), color: "#fff", fontSize: "0.7rem" }}
              >
                Book
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
                    {!isUser && renderMessageActions(msg)}
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
    </Box>
  );
}
