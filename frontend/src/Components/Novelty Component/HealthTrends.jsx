import React, { useEffect, useState, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Alert from "@mui/material/Alert";
import { apiUrl } from "../../utils/apiBase";
import { brand } from "../../theme/brand";
import { normalizeVitalsList, buildVitalsTrendChart } from "../../utils/vitalsNormalize";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define color palette as constants
const COLORS = {
  darkGray: "#71717d",
  gray: "#828487",
  pink: "#e6317d",
  white: "#ffffff",
  blue: "#2b2c6c",
  green: "#2fb297",
};

function HealthTrends() {
  const [vitals, setVitals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [range, setRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [lastPrediction, setLastPrediction] = useState("");
  const [loadError, setLoadError] = useState("");
  const [latestVitalsLine, setLatestVitalsLine] = useState("");

  const chartRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchVitals = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadError("Sign in to view your vitals trends.");
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [vitalsRes, summaryRes] = await Promise.all([
          fetch(apiUrl("/api/vitals/user"), { headers }),
          fetch(apiUrl("/api/dashboard/summary?portal=patient"), { headers }),
        ]);

        if (!vitalsRes.ok) {
          throw new Error(`Vitals API: ${vitalsRes.status}`);
        }

        const raw = await vitalsRes.json();
        const normalized = normalizeVitalsList(raw);
        setVitals(normalized);
        setFiltered(applyDateFilter(normalized, 7));
        setLoadError("");

        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          const latest = summary.latestVitals;
          if (latest) {
            setLatestVitalsLine(
              `Latest: BP ${latest.bp}, pulse ${latest.pulse}, sugar ${latest.sugar} mg/dL · ${new Date(
                latest.createdAt
              ).toLocaleString()}`
            );
          }
          const recent = summary.recentAnalyses?.[0];
          if (recent?.prediction) {
            setLastPrediction(recent.prediction);
          } else {
            setLastPrediction(localStorage.getItem("lastPrediction") || "");
          }
        }
      } catch (err) {
        console.error("Error fetching vitals:", err);
        setLoadError("Could not load vitals. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, []);

  const applyDateFilter = (data, days) => {
    if (days >= 9999) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter((v) => new Date(v.createdAt) >= cutoff);
  };

  const handleRangeChange = (e) => {
    const value = e.target.value;
    setRange(value);
    setFiltered(applyDateFilter(vitals, parseInt(value)));
  };

  const exportPDF = () => {
    const input = chartRef.current;

    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Landscape for better chart visibility
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`health-trends-${new Date().toLocaleDateString()}.pdf`);
    });
  };

  // Format dates to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const labels = filtered.map((v) => formatDate(v.createdAt));
  const bpData = filtered.map((v) => v.bp);
  const pulseData = filtered.map((v) => v.pulse);
  const sugarData = filtered.map((v) => v.sugar);

  const generateChart = (title, data, color, fill = false) => ({
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: fill ? `${color}33` : color, // Add transparency for fill
        borderWidth: 2,
        fill,
        tension: 0.3,
        pointBackgroundColor: COLORS.white,
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 12,
          },
          color: COLORS.darkGray,
        },
      },
      tooltip: {
        backgroundColor: COLORS.white,
        titleColor: COLORS.darkGray,
        bodyColor: COLORS.darkGray,
        borderColor: COLORS.gray,
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: COLORS.darkGray,
        },
      },
      y: {
        grid: {
          color: `${COLORS.gray}33`, // Light grid lines
        },
        ticks: {
          color: COLORS.darkGray,
        },
      },
    },
  };

  const combinedChart = buildVitalsTrendChart(filtered, brand);
  const combinedOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { position: "bottom", labels: { boxWidth: 10, padding: 8 } },
    },
  };

  const renderNoDataMessage = () => (
    <Box
      sx={{
        height: 250,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="body1" color={COLORS.darkGray}>
        No data available for the selected time range
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setRange("9999")}
      >
        View All Data
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="xl" className="py-2">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            p: 3,
            backgroundColor: COLORS.white,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <TrendingUpIcon
              sx={{ color: COLORS.pink, mr: 1.5, fontSize: 28 }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: COLORS.blue,
                fontSize: isMobile ? "1.5rem" : "2rem",
              }}
            >
              Health Trends
            </Typography>
          </Box>

          {loadError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          )}

          {lastPrediction && (
            <Typography
              variant="body1"
              sx={{ mb: 2, color: COLORS.pink, fontWeight: 500 }}
            >
              Latest symptom AI result: {lastPrediction}
            </Typography>
          )}

          {filtered.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${COLORS.gray}20`,
              }}
            >
              <Typography variant="h6" sx={{ color: COLORS.blue, mb: 1, fontWeight: 600 }}>
                Combined vitals (same as dashboard)
              </Typography>
              {latestVitalsLine && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {latestVitalsLine}
                </Typography>
              )}
              <Box sx={{ height: { xs: 240, md: 300 } }}>
                <Line data={combinedChart} options={combinedOptions} />
              </Box>
            </Paper>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              mb: 4,
              gap: 2,
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <InputLabel id="range-select-label">Time Range</InputLabel>
              <Select
                labelId="range-select-label"
                value={range}
                label="Time Range"
                onChange={handleRangeChange}
              >
                <MenuItem value="7">Last 7 Days</MenuItem>
                <MenuItem value="30">Last 30 Days</MenuItem>
                <MenuItem value="90">Last 90 Days</MenuItem>
                <MenuItem value="365">Last Year</MenuItem>
                <MenuItem value="9999">All Time</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportPDF}
              sx={{
                backgroundColor: COLORS.blue,
                "&:hover": {
                  backgroundColor: `${COLORS.blue}dd`,
                },
                borderRadius: 2,
                px: 3,
              }}
            >
              Export Report
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
              <CircularProgress sx={{ color: COLORS.pink }} />
            </Box>
          ) : (
            <div ref={chartRef}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${COLORS.gray}20`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: COLORS.darkGray,
                        fontWeight: 500,
                        pb: 1,
                      }}
                    >
                      Blood Pressure (mmHg)
                    </Typography>
                    {filtered.length > 0 ? (
                      <Box sx={{ height: 250 }}>
                        <Line
                          data={generateChart("BP", bpData, COLORS.pink, true)}
                          options={chartOptions}
                        />
                      </Box>
                    ) : (
                      renderNoDataMessage()
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${COLORS.gray}20`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: COLORS.darkGray,
                        fontWeight: 500,
                        pb: 1,
                      }}
                    >
                      Pulse Rate (bpm)
                    </Typography>
                    {filtered.length > 0 ? (
                      <Box sx={{ height: 250 }}>
                        <Line
                          data={generateChart(
                            "Pulse",
                            pulseData,
                            COLORS.blue,
                            true
                          )}
                          options={chartOptions}
                        />
                      </Box>
                    ) : (
                      renderNoDataMessage()
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${COLORS.gray}20`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: COLORS.darkGray,
                        fontWeight: 500,
                        pb: 1,
                      }}
                    >
                      Blood Sugar (mg/dL)
                    </Typography>
                    {filtered.length > 0 ? (
                      <Box sx={{ height: 250 }}>
                        <Bar
                          data={generateChart("Sugar", sugarData, COLORS.green)}
                          options={{
                            ...chartOptions,
                            barPercentage: 0.6,
                          }}
                        />
                      </Box>
                    ) : (
                      renderNoDataMessage()
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </div>
          )}
        </Paper>
      </Container>
  );
}

export default HealthTrends;
