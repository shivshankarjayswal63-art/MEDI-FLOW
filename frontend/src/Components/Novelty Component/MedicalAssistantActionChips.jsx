import { Box, Chip } from "@mui/material";

/**
 * @param {object} props
 * @param {object[]} props.actions
 * @param {(label: string, selection: object) => void} props.onSelection
 * @param {(action: object) => void} props.onConfirm
 * @param {boolean} props.disabled
 */
export default function MedicalAssistantActionChips({ actions, onSelection, onConfirm, disabled }) {
  if (!actions?.length) return null;

  return (
    <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {actions.flatMap((a) => {
        if (a.type === "pick_doctor") {
          return (a.doctors || []).map((d) => (
            <Chip
              key={`doc-${d.doctorId}`}
              label={d.doctorName}
              onClick={() =>
                onSelection(`Doctor: ${d.doctorName}`, {
                  kind: "doctor",
                  doctorId: d.doctorId,
                  doctorName: d.doctorName,
                })
              }
              disabled={disabled}
              color="primary"
              variant="outlined"
              size="small"
            />
          ));
        }
        if (a.type === "pick_date") {
          return (a.dates || []).map((d) => (
            <Chip
              key={`date-${a.doctorId}-${d.date}`}
              label={d.label || d.date}
              onClick={() =>
                onSelection(`Date: ${d.label || d.date}`, {
                  kind: "date",
                  doctorId: a.doctorId,
                  date: d.date,
                })
              }
              disabled={disabled}
              color="primary"
              variant="outlined"
              size="small"
            />
          ));
        }
        if (a.type === "pick_time") {
          return (a.times || []).map((t) => (
            <Chip
              key={`time-${a.date}-${t.time}`}
              label={t.label || t.time}
              onClick={() =>
                onSelection(`Time: ${t.time}`, {
                  kind: "time",
                  doctorId: a.doctorId,
                  date: a.date,
                  time: t.time,
                })
              }
              disabled={disabled}
              color="primary"
              variant="outlined"
              size="small"
            />
          ));
        }
        if (a.type === "pick_visit_mode") {
          return (a.modes || []).map((m) => (
            <Chip
              key={`mode-${m.mode}`}
              label={m.label}
              onClick={() =>
                onSelection(m.label, {
                  kind: "visit_mode",
                  doctorId: a.doctorId,
                  visitMode: m.mode,
                })
              }
              disabled={disabled}
              color="secondary"
              variant="outlined"
              size="small"
            />
          ));
        }
        if (a.type === "confirm_booking") {
          return (
            <Chip
              key="confirm-book"
              label="Confirm booking"
              onClick={() => onConfirm(a)}
              disabled={disabled}
              color="success"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          );
        }
        return [];
      })}
    </Box>
  );
}
