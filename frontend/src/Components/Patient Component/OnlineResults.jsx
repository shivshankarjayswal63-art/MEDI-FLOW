import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "./PatientLayout";
import axios from "axios";
import { Typography, Card, CardContent, Button, Link as MuiLink } from "@mui/material";
import { brand } from "../../theme/brand";
import EmptyState from "../EmptyState";

function OnlineResults() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

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
    <PatientLayout>
      <Typography variant="h4" fontWeight={700} sx={{ color: brand.primary, mb: 3 }}>
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
              <MuiLink
                href={`${import.meta.env.VITE_API_URL}/${r.filePath || r.file_path}`}
                target="_blank"
                rel="noreferrer"
              >
                View file
              </MuiLink>
            </CardContent>
          </Card>
        ))
      )}
      <Button sx={{ mt: 2 }} onClick={() => navigate("/patient-dashboard")}>
        Back to dashboard
      </Button>
    </PatientLayout>
  );
}

export default OnlineResults;
