import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Chip,
  Divider,
  useTheme,
  Fade,
  TextField,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { uploadMedicalReport } from "../../../services/reportService";
import Swal from "sweetalert2";

function ReportUploadDialog({ onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientNotes, setPatientNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a PDF, JPEG, or PNG file.',
        confirmButtonColor: '#2b2c6c',
      });
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size should not exceed 10MB.',
        confirmButtonColor: '#2b2c6c',
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        title: "No File Selected",
        text: "Please select a file to upload.",
        icon: "warning",
        confirmButtonColor: "#2b2c6c",
      });
      return;
    }

    const formData = new FormData();
    formData.append("report", selectedFile);
    if (patientNotes.trim()) {
      formData.append("patientNotes", patientNotes.trim());
    }

    try {
      setUploading(true);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      const result = await uploadMedicalReport(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Report Uploaded",
          text: "Your report was uploaded. The assistant will use it for personalized doctor recommendations.",
          confirmButtonColor: "#2fb297",
        });
        onSuccess(result);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      const data = error.response?.data;
      const detail =
        (typeof data === "object" && (data?.error || data?.message)) ||
        error.message ||
        "There was a problem uploading your report. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: detail,
        confirmButtonColor: "#e03131",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const getFileIcon = () => {
    if (!selectedFile) return null;
    const fileType = selectedFile.type;
    
    if (fileType === 'application/pdf') {
      return <PdfIcon sx={{ fontSize: 40, color: "#e03131" }} />;
    } else if (fileType.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 40, color: "#2fb297" }} />;
    } else {
      return <FileIcon sx={{ fontSize: 40, color: "#2b2c6c" }} />;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <Dialog 
      open 
      onClose={!uploading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight="bold" color="#2b2c6c">
          Upload Medical Report
        </Typography>
        {!uploading && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        {uploading ? (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Uploading file...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(47, 178, 151, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2fb297',
                }
              }} 
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              {getFileIcon()}
              <Box sx={{ ml: 2, flex: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {selectedFile?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile?.size)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            {!selectedFile ? (
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
                  borderRadius: 2,
                  bgcolor: dragActive ? 'rgba(43, 44, 108, 0.05)' : 'transparent',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  my: 2,
                  height: 200,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: 'rgba(43, 44, 108, 0.03)',
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <UploadIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: dragActive ? '#2b2c6c' : theme.palette.grey[400],
                    mb: 2,
                  }} 
                />
                <Typography variant="body1" fontWeight="medium" textAlign="center" gutterBottom>
                  {dragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  PDF, PNG, JPEG (max 10MB)
                </Typography>
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  my: 2,
                  border: `1px solid ${theme.palette.grey[200]}`,
                  borderRadius: 2,
                  background: 'rgba(47, 178, 151, 0.04)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      mr: 2, 
                      bgcolor: 'white', 
                      borderRadius: 1,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                    }}
                  >
                    {getFileIcon()}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
                          {selectedFile.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(selectedFile.size)}
                          </Typography>
                          <Chip
                            size="small"
                            label={selectedFile.type.split('/')[1].toUpperCase()}
                            sx={{
                              ml: 1,
                              fontSize: '0.65rem',
                              height: 20,
                              backgroundColor: selectedFile.type === 'application/pdf' ? 
                                'rgba(224, 49, 49, 0.1)' : 
                                'rgba(47, 178, 151, 0.1)',
                              color: selectedFile.type === 'application/pdf' ? 
                                '#e03131' : 
                                '#2fb297',
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={handleRemoveFile}
                        sx={{ 
                          color: '#e03131', 
                          bgcolor: 'rgba(224, 49, 49, 0.05)',
                          '&:hover': { bgcolor: 'rgba(224, 49, 49, 0.1)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
            
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="What is this report about? (helps AI matching)"
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. Chest pain follow-up, lipid panel, skin allergy test"
              sx={{ mt: 2 }}
              disabled={uploading}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                PDF or images up to 10MB. The medical assistant uses your reports with your profile to recommend doctors.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          disabled={uploading}
          variant="outlined"
          sx={{
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.grey[400],
              bgcolor: 'rgba(0, 0, 0, 0.02)',
            },
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          sx={{
            bgcolor: "#2fb297",
            '&:hover': { bgcolor: "#25997f" },
            '&.Mui-disabled': {
              bgcolor: 'rgba(47, 178, 151, 0.12)',
              color: 'rgba(47, 178, 151, 0.26)',
            },
            borderRadius: 2,
            px: 3,
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportUploadDialog;