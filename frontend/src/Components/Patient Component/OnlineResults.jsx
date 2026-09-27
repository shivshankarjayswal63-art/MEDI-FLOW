import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Chip,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import { brand } from "../../theme/brand";
import { pageTitleSx, pageContainerSx } from "../../theme/responsive";
import EmptyState from "../EmptyState";
import { openReportPdf } from "../../utils/openReportPdf";
import { getMedicalReports } from "../../services/reportService";
import ReportUploadDialog from "../User Component/MedicalReports/ReportUploadDialog";

function OnlineResults() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [openingId, setOpeningId] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const data = await getMedicalReports();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      setReports([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadReports();
  }, [navigate, loadReports]);

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

  return (
    <Box sx={pageContainerSx}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Typography variant="h4" sx={{ ...pageTitleSx, color: brand.primary }}>
          Lab reports
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadOpen(true)}
            sx={{ bgcolor: brand.success }}
          >
            Upload report
          </Button>
          <Button
            component={RouterLink}
            to="/User-Account"
            variant="outlined"
            startIcon={<PersonIcon />}
          >
            Update profile
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Upload past lab results and complete <strong>My profile</strong> (conditions, allergies). The{" "}
        <strong>Medical assistant</strong> uses this with your symptoms to recommend the best doctor.
      </Alert>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          message="Upload blood tests, X-rays, or other PDFs. Add a short note so AI can match you to the right specialist."
        />
      ) : (
        reports.map((r) => {
          const id = r._id || r.id;
          const summary = r.reportSummary || r.report_summary;
          const tags = r.aiTags || r.ai_tags || [];
          return (
            <Card key={id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography fontWeight={600}>{r.fileName || r.file_name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {new Date(r.uploadedAt || r.uploaded_at).toLocaleString()}
                </Typography>
                {summary && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {String(summary).replace(/\*\*/g, "")}
                  </Typography>
                )}
                {tags?.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                    {tags.slice(0, 6).map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  disabled={openingId === id}
                  onClick={() => openReport(r)}
                >
                  {openingId === id ? "Opening…" : "View PDF"}
                </Button>
              </CardContent>
            </Card>
          );
        })
      )}

      {uploadOpen && (
        <ReportUploadDialog
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            setUploadOpen(false);
            loadReports();
          }}
        />
      )}

      <Button
        fullWidth={false}
        sx={{ mt: 2, width: { xs: "100%", sm: "auto" } }}
        onClick={() => navigate("/medical-assistant")}
      >
        Open medical assistant
      </Button>
    </Box>
  );
}

export default OnlineResults;
