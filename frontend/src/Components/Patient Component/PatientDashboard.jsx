import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Grid, Card, CardContent, Typography, Button, Chip, Box } from "@mui/material";
import { brand } from "../../theme/brand";
import EmptyState from "../EmptyState";
const quickLinks = [
  { label: "Find a doctor", path: "/Find-Doctor", color: brand.primary },
  { label: "Book appointment", path: "/Book-Appointment", color: brand.success },
  { label: "Symptom AI", path: "/symptom-analysis", color: brand.accent },
  { label: "Analysis history", path: "/analysis-history", color: brand.accent },
  { label: "Lab results", path: "/online-results", color: brand.primary },
];

function PatientDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const userId = localStorage.getItem("userId");
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/appoinment`)
      .then((r) => {
        const all = r.data?.appoinments || r.data || [];
        const list = Array.isArray(all) ? all : [];
        const mine = userId
          ? list.filter((a) => String(a.userId || a.user_id) === String(userId))
          : list;
        setAppointments(mine.slice(0, 6));
      })
      .catch(() => setAppointments([]));

    if (userId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => setUserName(r.data?.name || ""))
        .catch(() => {});
    }
  }, [navigate]);

  return (
    <>
      <Typography variant="h4" fontWeight={700} sx={{ color: brand.primary, mb: 0.5 }}>
        {userName ? `Welcome, ${userName}` : "My Health Hub"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Use the sidebar for every patient service — appointments, vitals, AI tools, and reports.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickLinks.map((item) => (
          <Grid item xs={6} md={3} key={item.path}>
            <Button
              component={Link}
              to={item.path}
              fullWidth
              variant="contained"
              sx={{
                py: 2.5,
                bgcolor: item.color,
                "&:hover": { bgcolor: item.color, filter: "brightness(0.92)" },
              }}
            >
              {item.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your appointments</Typography>
          {appointments.length === 0 ? (
            <EmptyState
              title="No appointments yet"
              message="Book a visit or request a consultation from the menu."
              actionLabel="Book appointment"
              onAction={() => navigate("/Book-Appointment")}
            />
          ) : (
            appointments.map((a) => (
              <Card key={a._id || a.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography fontWeight={600}>{a.doctorName || a.doctor_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.indexno} · {new Date(a.date).toLocaleDateString()} · {a.time}
                      </Typography>
                    </Box>
                    <Chip label={a.status} color={a.status === "Completed" ? "success" : "primary"} />
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, bgcolor: brand.lightBg }}>
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Health tools</Typography>
              {[
                { t: "Record vitals", p: "/enter-vitals" },
                { t: "Analysis history", p: "/analysis-history" },
                { t: "Health trends", p: "/health-trends" },
                { t: "Edit profile", p: "/User-Account" },
              ].map((x) => (
                <Button key={x.p} component={Link} to={x.p} fullWidth sx={{ justifyContent: "flex-start", mb: 1 }}>
                  {x.t}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default PatientDashboard;
