import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";
import { apiUrl } from "../../utils/apiBase";
import { getUserFacingApiError } from "../../utils/apiErrors";

import {

  Grid,

  Card,

  CardContent,

  Typography,

  Button,

  Chip,

  Box,

  CircularProgress,

  List,

  ListItem,

  ListItemText,

  Divider,

  Alert,

  useMediaQuery,

  useTheme,

} from "@mui/material";

import {

  Chart as ChartJS,

  CategoryScale,

  LinearScale,

  PointElement,

  LineElement,

  Title,

  Tooltip,

  Legend,

} from "chart.js";

import { Line } from "react-chartjs-2";

import { brand } from "../../theme/brand";

import { pageTitleSx, pageSubtitleSx, pageContainerSx } from "../../theme/responsive";

import EmptyState from "../EmptyState";



ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



const quickLinks = [

  { label: "Find a doctor", path: "/Find-Doctor", color: brand.primary },

  { label: "Book appointment", path: "/Book-Appointment", color: brand.success },

  { label: "Medical assistant", path: "/medical-assistant", color: brand.accent },

  { label: "Symptom AI", path: "/symptom-analysis", color: brand.primary },

  { label: "Lab results", path: "/online-results", color: brand.success },

];



const emptySummary = {

  profile: {},

  counts: {},

  latestVitals: null,

  vitalsTrend: [],

  recentAppointments: [],

  recentAnalyses: [],

  recentReports: [],

  recentPrescriptions: [],

  recentNotifications: [],

};



function StatCard({ label, value, sub, color }) {

  return (

    <Card sx={{ borderRadius: 2, height: "100%" }}>

      <CardContent sx={{ py: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>

          {label}

        </Typography>

        <Typography

          fontWeight={700}

          sx={{ color: color || brand.primary, fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" } }}

        >

          {value ?? "—"}

        </Typography>

        {sub && (

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>

            {sub}

          </Typography>

        )}

      </CardContent>

    </Card>

  );

}



function PatientDashboard() {

  const navigate = useNavigate();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [data, setData] = useState(emptySummary);



  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

      navigate("/login");

      return;

    }

    const headers = { Authorization: `Bearer ${token}` };

    axios

      .get(apiUrl("/api/dashboard/summary?portal=patient"), { headers })

      .then((r) => {

        setLoadError("");

        setData({ ...emptySummary, ...r.data });

      })

      .catch((err) => {

        setData(emptySummary);

        if (err.response?.status === 401) {

          navigate("/login");

          return;

        }

        setLoadError(
          getUserFacingApiError(
            err,
            "We could not load your dashboard. Please refresh the page or sign in again."
          )
        );

      })

      .finally(() => setLoading(false));

  }, [navigate]);



  const {

    profile,

    counts,

    latestVitals,

    vitalsTrend,

    recentAppointments,

    recentAnalyses,

    recentReports,

    recentPrescriptions,

    recentNotifications,

  } = data;

  const userName = profile?.name || "";



  const chartLabels = (vitalsTrend || []).map((v) =>

    new Date(v.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })

  );

  const chartData = {

    labels: chartLabels.length ? chartLabels : ["—"],

    datasets: [

      {

        label: "BP",

        data: vitalsTrend?.length ? vitalsTrend.map((v) => v.bp) : [0],

        borderColor: brand.primary,

        tension: 0.3,

        pointRadius: isMobile ? 2 : 3,

      },

      {

        label: "Pulse",

        data: vitalsTrend?.length ? vitalsTrend.map((v) => v.pulse) : [0],

        borderColor: brand.success,

        tension: 0.3,

        pointRadius: isMobile ? 2 : 3,

      },

      {

        label: "Sugar",

        data: vitalsTrend?.length ? vitalsTrend.map((v) => v.sugar) : [0],

        borderColor: brand.accent,

        tension: 0.3,

        pointRadius: isMobile ? 2 : 3,

      },

    ],

  };



  const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {

        position: "bottom",

        labels: { boxWidth: 10, padding: 8, font: { size: isMobile ? 10 : 12 } },

      },

    },

    scales: {

      x: {

        ticks: {

          maxRotation: isMobile ? 45 : 0,

          autoSkip: true,

          maxTicksLimit: isMobile ? 6 : 12,

          font: { size: isMobile ? 10 : 11 },

        },

      },

      y: {

        ticks: { font: { size: isMobile ? 10 : 11 } },

      },

    },

  };



  if (loading) {

    return (

      <Box display="flex" justifyContent="center" py={8}>

        <CircularProgress sx={{ color: brand.primary }} />

      </Box>

    );

  }



  const hasAnyData =

    (counts.appointments || 0) > 0 ||

    (counts.vitals || 0) > 0 ||

    (counts.analyses || 0) > 0 ||

    (counts.labReports || 0) > 0;



  return (

    <Box sx={pageContainerSx}>

      <Typography variant="h4" sx={{ ...pageTitleSx, color: brand.primary, mb: 0.5 }}>

        {userName ? `Welcome, ${userName.split(" ")[0]}` : "My Health Hub"}

      </Typography>

      <Typography color="text.secondary" sx={pageSubtitleSx}>

        Your vitals, appointments, AI checks, and lab results in one place.

      </Typography>



      {loadError && (

        <Alert severity="warning" sx={{ mb: 2 }}>

          {loadError}

        </Alert>

      )}



      {profile?.bloodGroup && (

        <Box sx={{ mb: { xs: 2, md: 3 }, display: "flex", flexWrap: "wrap", gap: 1 }}>

          <Chip label={`Blood: ${profile.bloodGroup}`} size="small" />

          {profile.city && <Chip label={profile.city} size="small" variant="outlined" />}

          {profile.mobile && (

            <Chip label={profile.mobile} size="small" variant="outlined" sx={{ maxWidth: "100%" }} />

          )}

        </Box>

      )}



      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>

        <Grid item xs={6} sm={4} md={2.4}>

          <StatCard

            label="Appointments"

            value={counts.appointments}

            sub={`${counts.upcomingAppointments || 0} upcoming`}

          />

        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>

          <StatCard label="Vitals" value={counts.vitals} color={brand.success} />

        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>

          <StatCard label="AI checks" value={counts.analyses} color={brand.accent} />

        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>

          <StatCard label="Lab reports" value={counts.labReports} />

        </Grid>

        <Grid item xs={12} sm={8} md={2.4}>

          <StatCard

            label="Prescriptions"

            value={counts.prescriptions}

            sub={`${counts.unreadNotifications || 0} alerts`}

          />

        </Grid>

      </Grid>



      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>

        {quickLinks.map((item) => (

          <Grid item xs={12} sm={6} md={3} key={item.path}>

            <Button

              component={Link}

              to={item.path}

              fullWidth

              variant="contained"

              sx={{

                py: { xs: 1.25, md: 2 },

                fontSize: { xs: "0.875rem", md: "1rem" },

                bgcolor: item.color,

                "&:hover": { bgcolor: item.color, filter: "brightness(0.92)" },

              }}

            >

              {item.label}

            </Button>

          </Grid>

        ))}

      </Grid>



      {!hasAnyData && !loadError && (

        <EmptyState

          title="No health data yet"

          message="Run npm run db:seed in BACKEND (same Supabase as production), then log in as patient1@demo.com."

          actionLabel="Book appointment"

          onAction={() => navigate("/Book-Appointment")}

        />

      )}



      <Grid container spacing={{ xs: 2, md: 3 }}>

        <Grid item xs={12} md={7}>

          <Card sx={{ borderRadius: 2, mb: { xs: 2, md: 3 } }}>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>

                Vitals trend

              </Typography>

              {latestVitals ? (

                <>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: "break-word" }}>

                    Latest: BP {latestVitals.bp}, pulse {latestVitals.pulse}, sugar {latestVitals.sugar} mg/dL ·{" "}

                    {new Date(latestVitals.createdAt).toLocaleString()}

                  </Typography>

                  <Box sx={{ height: { xs: 220, sm: 280, md: 300 }, width: "100%", minWidth: 0 }}>

                    <Line data={chartData} options={chartOptions} />

                  </Box>

                  <Button component={Link} to="/health-trends" size="small" sx={{ mt: 2 }}>

                    Full health trends

                  </Button>

                </>

              ) : (

                <Typography color="text.secondary" variant="body2">

                  No vitals yet. Use Record vitals from the menu.

                </Typography>

              )}

            </CardContent>

          </Card>



          <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>

            Your appointments

          </Typography>

          {recentAppointments.length === 0 ? (

            <EmptyState

              title="No appointments"

              message="Book a visit or request a consultation."

              actionLabel="Book appointment"

              onAction={() => navigate("/Book-Appointment")}

            />

          ) : (

            recentAppointments.map((a) => (

              <Card key={a._id || a.id} sx={{ mb: 2, borderRadius: 2 }}>

                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

                  <Box

                    display="flex"

                    justifyContent="space-between"

                    alignItems={{ xs: "flex-start", sm: "center" }}

                    flexDirection={{ xs: "column", sm: "row" }}

                    gap={1}

                  >

                    <Box sx={{ minWidth: 0, width: "100%" }}>

                      <Typography fontWeight={600} sx={{ wordBreak: "break-word" }}>

                        {a.doctorName || a.doctor_name}

                      </Typography>

                      <Typography variant="body2" color="text.secondary">

                        {a.specialization} · {a.indexno}

                      </Typography>

                      <Typography variant="body2" color="text.secondary">

                        {new Date(a.date).toLocaleDateString()} · {a.time}

                      </Typography>

                    </Box>

                    <Chip

                      label={a.status}

                      size={isMobile ? "small" : "medium"}

                      sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}

                      color={

                        a.status === "Completed"

                          ? "success"

                          : a.status === "Pending"

                            ? "warning"

                            : "primary"

                      }

                    />

                  </Box>

                </CardContent>

              </Card>

            ))

          )}

        </Grid>



        <Grid item xs={12} md={5}>

          <Card sx={{ borderRadius: 2, mb: { xs: 2, md: 3 } }}>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              <Typography fontWeight={600} sx={{ mb: 1 }}>Recent symptom AI</Typography>

              <List dense disablePadding>

                {recentAnalyses.map((row, i) => (

                  <React.Fragment key={row._id || row.id || i}>

                    <ListItem disableGutters sx={{ alignItems: "flex-start" }}>

                      <ListItemText

                        primary={row.prediction}

                        secondary={`${(row.symptoms || []).join(", ")} · ${new Date(row.createdAt).toLocaleDateString()}`}

                        primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}

                        secondaryTypographyProps={{ variant: "caption", sx: { wordBreak: "break-word" } }}

                      />

                    </ListItem>

                    {i < recentAnalyses.length - 1 && <Divider />}

                  </React.Fragment>

                ))}

              </List>

              {!recentAnalyses.length && (

                <Typography variant="body2" color="text.secondary">No analyses yet.</Typography>

              )}

              <Button component={Link} to="/analysis-history" size="small" sx={{ mt: 1 }}>

                Analysis history

              </Button>

            </CardContent>

          </Card>



          <Card sx={{ borderRadius: 2, mb: { xs: 2, md: 3 } }}>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              <Typography fontWeight={600} sx={{ mb: 1 }}>Lab reports</Typography>

              <List dense disablePadding>

                {recentReports.map((r) => (

                  <ListItem key={r._id || r.id} disableGutters>

                    <ListItemText

                      primary={r.fileName || r.file_name}

                      secondary={r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : ""}

                      primaryTypographyProps={{ variant: "body2", sx: { wordBreak: "break-word" } }}

                    />

                  </ListItem>

                ))}

              </List>

              {!recentReports.length && (

                <Typography variant="body2" color="text.secondary">No reports uploaded.</Typography>

              )}

              <Button component={Link} to="/online-results" size="small" sx={{ mt: 1 }}>

                View all results

              </Button>

            </CardContent>

          </Card>



          <Card sx={{ borderRadius: 2, mb: { xs: 2, md: 3 } }}>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              <Typography fontWeight={600} sx={{ mb: 1 }}>Prescriptions</Typography>

              {recentPrescriptions.map((p) => (

                <Box key={p._id || p.id} sx={{ mb: 1.5 }}>

                  <Typography variant="body2" fontWeight={600}>

                    {new Date(p.dateIssued).toLocaleDateString()}

                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ wordBreak: "break-word" }}>

                    {(Array.isArray(p.medicine) ? p.medicine : [])

                      .map((m) => `${m.medicineName || m.name} ${m.dosage || ""}`)

                      .join(" · ") || "Medicines on file"}

                  </Typography>

                </Box>

              ))}

              {!recentPrescriptions.length && (

                <Typography variant="body2" color="text.secondary">No prescriptions yet.</Typography>

              )}

            </CardContent>

          </Card>



          <Card sx={{ borderRadius: 2, bgcolor: brand.lightBg }}>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

              <Typography fontWeight={600} sx={{ mb: 1 }}>Notifications</Typography>

              <List dense disablePadding>

                {recentNotifications.map((n) => (

                  <ListItem key={n._id || n.id} disableGutters sx={{ alignItems: "flex-start" }}>

                    <ListItemText

                      primary={n.title}

                      secondary={n.body}

                      primaryTypographyProps={{ fontWeight: n.read ? 400 : 600, variant: "body2" }}

                      secondaryTypographyProps={{ variant: "caption", sx: { wordBreak: "break-word" } }}

                    />

                  </ListItem>

                ))}

              </List>

              {!recentNotifications.length && (

                <Typography variant="body2" color="text.secondary">No notifications.</Typography>

              )}

            </CardContent>

          </Card>

        </Grid>

      </Grid>

    </Box>

  );

}



export default PatientDashboard;


