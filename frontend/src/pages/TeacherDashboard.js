import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../utils/api";
import { getAuthToken, setAuthToken } from "../utils/AuthUtils";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Button,
  Container,
} from "@mui/material";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("students");
  
  // Fetch students data
  const fetchStudents = useCallback(async () => {
    try {
      setAuthToken(getAuthToken());
      const response = await axios.get(apiUrl("/api/teacher/students"));
      setStudents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load students";
      // Don't overwrite error if already set from leaderboard
      if (!error) setError(errorMsg);
    }
  }, [error]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setAuthToken(getAuthToken());
      const response = await axios.get(apiUrl("/api/teacher/leaderboard"));
      setLeaderboard(response.data || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load leaderboard";
      if (!error) setError(errorMsg);
    }
  }, [error]);

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    Promise.all([fetchStudents(), fetchLeaderboard()])
      .catch(err => {
        console.error("Error fetching data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Auto-retry on error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        fetchStudents();
        fetchLeaderboard();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, fetchStudents, fetchLeaderboard]);

  // Handle tab change
  const handleTabChange = (event, newTab) => {
    if (newTab) {
      setActiveTab(newTab);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([fetchStudents(), fetchLeaderboard()])
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle student card click
  const handleStudentClick = (studentId) => {
    navigate(`/teacher/students/${studentId}`);
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

  // Get medal emoji for top 3
  const getMedalEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pt: 2 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 3, fontWeight: "bold", color: "#333" }}
        >
          Teacher Dashboard
        </Typography>

        {/* Tab Toggle */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={handleTabChange}
            aria-label="dashboard tab selection"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                px: 3,
                py: 1,
              },
            }}
          >
            <ToggleButton value="students">Students</ToggleButton>
            <ToggleButton value="leaderboard">Leaderboard</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {!loading && error && (
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
        )}

        {/* Students Tab */}
        {!loading && !error && activeTab === "students" && (
          <>
            {/* Empty State */}
            {students.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No students found.
              </Alert>
            )}

            {/* Student Cards Grid */}
            {students.length > 0 && (
              <Grid container spacing={3}>
                {students.map((student) => (
                  <Grid item xs={12} sm={6} md={4} key={student.id}>
                    <Card 
                      elevation={3}
                      sx={{ 
                        height: "100%",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleStudentClick(student.id)}
                        sx={{ height: "100%" }}
                      >
                        <CardContent>
                          <Typography variant="h6" component="div" gutterBottom>
                            {student.username}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 2 }}
                          >
                            {student.email}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Games Played
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {student.totalGamesPlayed || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Avg WPM
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {student.averageWpm != null ? student.averageWpm.toFixed(1) : "—"}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Accuracy
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {student.averageAccuracy != null ? `${student.averageAccuracy.toFixed(1)}%` : "—"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Leaderboard Tab */}
        {!loading && !error && activeTab === "leaderboard" && (
          <>
            {/* Empty State */}
            {leaderboard.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No scores yet.
              </Alert>
            )}

            {/* Leaderboard Table */}
            {leaderboard.length > 0 && (
              <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} aria-label="teacher leaderboard table">
                  <TableHead sx={{ backgroundColor: "#1976d2" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rank</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">WPM</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Accuracy</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Combined Score</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Game</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((entry, index) => {
                      const rank = entry.rank || index + 1;
                      
                      return (
                        <TableRow
                          key={`${entry.username}-${rank}`}
                          sx={{
                            "&:hover": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {getMedalEmoji(rank)}
                          </TableCell>
                          <TableCell>{entry.username}</TableCell>
                          <TableCell align="right">{entry.wpm || "—"}</TableCell>
                          <TableCell align="right">
                            {entry.accuracy != null ? `${entry.accuracy.toFixed(1)}%` : "—"}
                          </TableCell>
                          <TableCell align="right">
                            {entry.combinedScore != null ? entry.combinedScore.toFixed(2) : "—"}
                          </TableCell>
                          <TableCell>{entry.gameName || "—"}</TableCell>
                          <TableCell>{formatDate(entry.dateAchieved)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default TeacherDashboard;
