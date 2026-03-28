import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Container,
  Chip,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SpeedIcon from "@mui/icons-material/Speed";
import PercentIcon from "@mui/icons-material/Percent";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { apiUrl } from "../utils/api";
import { getAuthToken, setAuthToken } from "../utils/AuthUtils";

// Game display name mapping
const GAME_LABELS = {
  TYPING_TESTS: "Typing Test",
  FALLING_WORDS: "Falling Typing",
  GALAXY: "Galaxy Game",
  GRID: "Grid Game",
  BOOKWORM: "Bookworm",
  CROSSWORD: "Crossword",
  FOUR_PICS: "Four Pics",
  CODE_CHALLENGES: "Code Challenges",
  MAP: "Map Game",
  SYNTAX_SAVER: "Syntax Saver",
  CHALLENGES: "Challenges",
};

const TeacherStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Fetch student data
  const fetchStudentDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    
    try {
      setAuthToken(getAuthToken());
      
      const response = await axios.get(apiUrl(`/api/teacher/students/${id}`));
      setStudent(response.data);
    } catch (err) {
      console.error("Failed to fetch student detail:", err);
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.message || err.message || "Failed to load student details");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    setAuthToken(getAuthToken());
    fetchStudentDetail();
  }, [fetchStudentDetail]);

  // Auto-retry on error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        fetchStudentDetail();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, fetchStudentDetail]);

  // Manual refresh
  const handleRefresh = () => {
    fetchStudentDetail();
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/teacher/dashboard");
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get game display name
  const getGameLabel = (gameKey) => {
    return GAME_LABELS[gameKey] || gameKey;
  };

  // Transform bestScores map to array for table
  const getBestScoresArray = () => {
    if (!student || !student.bestScores) return [];
    
    // If bestScores is already an array
    if (Array.isArray(student.bestScores)) {
      return student.bestScores;
    }
    
    // If bestScores is a map/object
    return Object.entries(student.bestScores).map(([category, data]) => ({
      category,
      bestScore: data?.bestScore || data?.score || 0,
      bestWpm: data?.bestWpm || data?.wpm || 0,
      bestAccuracy: data?.bestAccuracy || data?.accuracy || 0,
      timesPlayed: data?.timesPlayed || data?.attempts || 0,
      dateAchieved: data?.dateAchieved || data?.date || null,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error} — Auto-retrying in 5 seconds...
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Student not found. The student may have been removed or the ID is incorrect.
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const bestScores = getBestScoresArray();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pt: 2, pb: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          component={Link}
          to="/teacher/dashboard"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2, textTransform: "none" }}
        >
          Back to Dashboard
        </Button>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#333" }}>
            Student Progress
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
            {student?.username || "Unknown User"}
          </Typography>
          <Chip 
            label={student?.email || "No email"} 
            size="small" 
            sx={{ mt: 1 }} 
            variant="outlined"
          />
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Games Played */}
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center" }}>
                <SportsEsportsIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
                <Typography variant="h3" color="primary" sx={{ fontWeight: "bold" }}>
                  {student?.totalGamesPlayed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Games Played
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Average WPM */}
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center" }}>
                <SpeedIcon sx={{ fontSize: 40, color: "#2e7d32", mb: 1 }} />
                <Typography variant="h3" color="success.main" sx={{ fontWeight: "bold" }}>
                  {student?.averageWpm != null ? student.averageWpm.toFixed(1) : "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average WPM
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Average Accuracy */}
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center" }}>
                <PercentIcon sx={{ fontSize: 40, color: "#ed6c02", mb: 1 }} />
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: "bold" }}>
                  {student?.averageAccuracy != null ? `${student.averageAccuracy.toFixed(1)}%` : "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Accuracy
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Best Scores Section */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
          Best Scores by Category
        </Typography>

        {bestScores.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No game scores recorded yet. This student hasn't played any games.
          </Alert>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="best scores table">
              <TableHead sx={{ backgroundColor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Game</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Best Score</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Best WPM</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Best Accuracy</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Times Played</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Last Played</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bestScores.map((score, index) => (
                  <TableRow
                    key={score.category || index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "white" : "#f5f5f5",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: "medium" }}>
                      {getGameLabel(score.category)}
                    </TableCell>
                    <TableCell align="right">
                      {score.bestScore || score.bestScore === 0 ? score.bestScore.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {score.bestWpm || score.bestWpm === 0 ? score.bestWpm : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {score.bestAccuracy != null ? `${score.bestAccuracy.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {score.timesPlayed || 0}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: "#666" }} />
                        {formatDate(score.dateAchieved)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Recent Activity Section */}
        {student?.recentActivity && student.recentActivity.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
              Recent Activity
            </Typography>

            <TableContainer component={Paper} elevation={3}>
              <Table sx={{ minWidth: 650 }} aria-label="recent activity table">
                <TableHead sx={{ backgroundColor: "#455a64" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Game</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Score</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">WPM</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Accuracy</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {student.recentActivity.slice(0, 10).map((activity, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? "white" : "#f5f5f5",
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                        },
                      }}
                    >
                      <TableCell>{getGameLabel(activity.category)}</TableCell>
                      <TableCell align="right">{activity.score || "—"}</TableCell>
                      <TableCell align="right">{activity.wpm || "—"}</TableCell>
                      <TableCell align="right">
                        {activity.accuracy != null ? `${activity.accuracy.toFixed(1)}%` : "—"}
                      </TableCell>
                      <TableCell>{formatDate(activity.dateAchieved)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Refresh Button */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleRefresh}>
            Refresh Data
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TeacherStudentDetail;
