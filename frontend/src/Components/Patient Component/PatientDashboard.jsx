import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../Nav Component/Nav";
import axios from "axios";
import { Container, Grid, Card, CardContent, Typography, Button, Chip, Box } from "@mui/material";
import { brand } from "../../theme/brand";
import EmptyState from "../EmptyState";

function PatientDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/appoinment`)
      .then((r) => {
        const all = r.data?.appoinments || r.data || [];
        setAppointments(Array.isArray(all) ? all.slice(0, 5) : []);
      })
      .catch(() => setAppointments([]));
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Nav />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: brand.primary }}>
          My Health Hub
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Appointments, vitals, and AI tools in one place.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: "Symptom analysis", path: "/symptom-analysis" },
            { label: "Enter vitals", path: "/enter-vitals" },
            { label: "Health trends", path: "/health-trends" },
            { label: "Lab results", path: "/online-results" },
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.path}>
              <Button component={Link} to={item.path} fullWidth variant="outlined" sx={{ py: 2, borderColor: brand.primary, color: brand.primary }}>
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent appointments</Typography>
        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            message="Book a visit or run db:seed for demo data."
            actionLabel="Book appointment"
            onAction={() => navigate("/Book-Appointment")}
          />
        ) : (
          appointments.map((a) => (
            <Card key={a._id} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>{a.doctorName || a.doctor_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.indexno} · {new Date(a.date).toLocaleDateString()} {a.time}
                    </Typography>
                  </Box>
                  <Chip label={a.status} color={a.status === "Completed" ? "success" : "primary"} />
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Container>
    </div>
  );
}

export default PatientDashboard;
