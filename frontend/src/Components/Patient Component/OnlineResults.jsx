import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Typography, Card, CardContent, Button, Box } from "@mui/material";
import { brand } from "../../theme/brand";
import { pageTitleSx, pageContainerSx } from "../../theme/responsive";
import EmptyState from "../EmptyState";
import { openReportPdf } from "../../utils/openReportPdf";

function OnlineResults() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [openingId, setOpeningId] = useState(null);

  const openReport = async (report) => {
    const id = report._id || report.id;
    if (!id) return;
    setOpeningId(id);
    try {
      await openReportPdf(report);
    } catch {
      alert("Could not open report. Try again after the API redeploys.");
    } finally {
      setOpeningId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setReports(r.data || []))
      .catch(() => setReports([]));
  }, [navigate]);

  return (
    <Box sx={pageContainerSx}>
      <Typography variant="h4" sx={{ ...pageTitleSx, color: brand.primary, mb: { xs: 2, md: 3 } }}>
        Online Results
      </Typography>
      {reports.length === 0 ? (
        <EmptyState title="No reports" message="Upload or seed demo medical reports to see them here." />
      ) : (
        reports.map((r) => (
          <Card key={r._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={600}>{r.fileName || r.file_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(r.uploadedAt || r.uploaded_at).toLocaleString()}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
                disabled={openingId === (r._id || r.id)}
                onClick={() => openReport(r)}
              >
                {openingId === (r._id || r.id) ? "Opening…" : "View PDF"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
      <Button fullWidth={false} sx={{ mt: 2, width: { xs: "100%", sm: "auto" } }} onClick={() => navigate("/patient-dashboard")}>
        Back to dashboard
      </Button>
    </Box>
  );
}

export default OnlineResults;
