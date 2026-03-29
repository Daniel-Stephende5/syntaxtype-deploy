import React, { useEffect, useState } from 'react';
import '../css/TotalDashboard.css';
import { API_BASE } from '../utils/api';
import { getAuthToken } from '../utils/JwtUtils';

const PersonalStatsDashboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in to view your stats.');
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/scores/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch scores');
        }
        return res.json();
      })
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching scores:', err);
        setError('Error loading scores: ' + err.message);
        setLoading(false);
      });
  }, []);

  // Group scores by game type
  const scoresByGame = scores.reduce((acc, score) => {
    const gameType = score.challengeType || 'Unknown';
    if (!acc[gameType]) {
      acc[gameType] = [];
    }
    acc[gameType].push(score);
    return acc;
  }, {});

  // Calculate personal bests per game
  const personalBests = Object.entries(scoresByGame).map(([gameType, gameScores]) => {
    const bestScore = Math.max(...gameScores.map(s => s.score || 0));
    const bestWpm = Math.max(...gameScores.map(s => s.wpm || 0));
    const avgAccuracy = gameScores.length > 0
      ? Math.round(gameScores.reduce((sum, s) => sum + (s.accuracy || 0), 0) / gameScores.length)
      : 0;
    return {
      gameType,
      bestScore,
      bestWpm,
      avgAccuracy,
      totalGames: gameScores.length
    };
  });

  // Get recent activity (last 10)
  const recentActivity = [...scores]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h2>📊 My Stats</h2>
        <p>Loading your stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h2>📊 My Stats</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>📊 My Stats</h2>

      {/* Personal Bests Summary */}
      <h3>🏆 Personal Bests</h3>
      {personalBests.length === 0 ? (
        <p>No games played yet. Start playing to see your stats!</p>
      ) : (
        <div className="stats-grid">
          {personalBests.map((pb, index) => (
            <div key={index} className="stat-card">
              <h4>{pb.gameType}</h4>
              <p><strong>Best Score:</strong> {pb.bestScore}</p>
              <p><strong>Best WPM:</strong> {pb.bestWpm}</p>
              <p><strong>Avg Accuracy:</strong> {pb.avgAccuracy}%</p>
              <p><strong>Games Played:</strong> {pb.totalGames}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <h3 style={{ marginTop: '40px' }}>📈 Recent Activity</h3>
      {recentActivity.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Game</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Score</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>WPM</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Accuracy</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Time (s)</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((entry, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{entry.challengeType || 'Unknown'}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.score || 0}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.wpm || 0}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.accuracy || 0}%</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{entry.timeInSeconds || 0}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{formatDate(entry.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Total Stats Summary */}
      <h3 style={{ marginTop: '40px' }}>📝 Overall Summary</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Games</h4>
          <p>{scores.length}</p>
        </div>
        <div className="stat-card">
          <h4>Games Played</h4>
          <p>{personalBests.length}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalStatsDashboard;
