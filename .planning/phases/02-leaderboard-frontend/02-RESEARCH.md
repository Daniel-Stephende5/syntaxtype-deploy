# Phase 2: Leaderboard Frontend - Research

**Researched:** 2026-03-23
**Phase:** 02-leaderboard-frontend

## Research Summary

This phase builds the frontend leaderboard UI that consumes the Phase 1 backend API. Key research areas: React patterns, MUI components, auth integration, and API consumption.

---

## Tech Stack Confirmation

| Component | Technology |
|-----------|------------|
| UI Library | MUI v7 (@mui/material) |
| Routing | React Router v6 |
| HTTP Client | Axios (via AuthUtils setAuthToken) |
| Auth State | AuthUtils.js (getAuthToken, subscribeToAuthChanges) |
| Build | react-scripts (cra) |

---

## Component Patterns

### Page Component Structure

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, ... } from "@mui/material";

const LeaderboardPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data on mount
    fetchLeaderboard();
  }, [/* dependencies */]);

  return (/* JSX */);
};

export default LeaderboardPage;
```

### API Integration Pattern

```javascript
import { API_BASE } from "../utils/api";
import { getAuthToken, setAuthToken } from "../utils/AuthUtils";

// Ensure auth token is set for each request
setAuthToken(getAuthToken()); // Initialize from localStorage

const fetchLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/leaderboards/global`, {
      params: { metric: "wpm" }
    });
    setData(response.data);
  } catch (err) {
    setError(err.message);
  }
};
```

### Auth-Aware Fetching

```javascript
// Fetch user-specific rank when logged in
const fetchUserRank = async (userId) => {
  if (!getAuthToken()) return null;
  const response = await axios.get(`${API_BASE}/api/leaderboards/user/${userId}`);
  return response.data;
};
```

---

## MUI Components Needed

| Component | Use Case |
|-----------|----------|
| Box | Container for layout |
| Typography | Text styling |
| Table, TableBody, TableCell, TableContainer, TableHead, TableRow | Leaderboard table |
| Select, MenuItem | Game filter dropdown |
| ToggleButtonGroup, ToggleButton | Metric toggle (WPM/Accuracy/Combined) |
| Switch | Best/Recent toggle |
| CircularProgress | Loading spinner |
| Alert | Error state |
| Button | Refresh, Register, Login |
| Tooltip | Combined score explanation |
| Paper | Table container with shadow |

---

## Backend API Contract

Based on Phase 1:

| Endpoint | Method | Params | Response |
|----------|--------|--------|----------|
| `/api/leaderboards/global` | GET | `metric` (wpm/accuracy/combined) | LeaderboardEntry[] |
| `/api/leaderboards/game/{category}` | GET | `metric` | LeaderboardEntry[] |
| `/api/leaderboards/user/{userId}` | GET | - | LeaderboardEntry[] (user's best per game) |

### LeaderboardEntry DTO

```typescript
interface LeaderboardEntry {
  rank: number;
  username: string;
  wpm: number;
  accuracy: number;
  combinedScore: number;
  gameName: string;
  dateAchieved: string; // ISO date
}
```

---

## Key Implementation Details

### Metric Toggle Debouncing

- Use setTimeout for 300ms debounce before API call
- Clear previous timeout on change

### localStorage Persistence

```javascript
const STORAGE_KEY = 'leaderboard_best_recent';
const getToggleState = () => localStorage.getItem(STORAGE_KEY) || 'best';
const setToggleState = (value) => localStorage.setItem(STORAGE_KEY, value);
```

### User Highlighting

- Compare entry.username with current user from JWT
- Apply special styling (background + border) to matching row

### Auto-Retry on Error

```javascript
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [error]);
```

---

## Game Types (for filter)

From Phase 1 context:
- TypingTest
- FallingTypingTest
- GalaxyGame
- GridGame
- Bookworm
- CrosswordGame

---

## Validation Architecture

### Plan Verification Strategy

1. **Static Analysis**: Check component renders without crashing
2. **API Integration**: Verify correct endpoint calls with params
3. **State Management**: Confirm loading/error/empty states handled
4. **Auth Integration**: Verify auth token usage

### Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Load leaderboard (logged in) | Shows 10 entries, user rank highlighted |
| Load leaderboard (guest) | Shows 10 entries, Register/Login banner |
| Filter by game | Shows entries for selected game only |
| Toggle metric | Re-fetches and re-sorts by new metric |
| Toggle best/recent | Changes time window filter |
| Network error | Shows error, auto-retries after 5s |
| Empty game | Shows encouraging empty state message |
| Complete game | Leaderboard refreshes automatically |

---

## Don't Hand-Roll

- JWT parsing (use jwt-decode from package.json)
- Auth token storage (use AuthUtils)
- API URL construction (use API_BASE from api.js)
- Date formatting (use native Date or Intl.DateTimeFormat)

---

## Common Pitfalls

1. **Forgetting setAuthToken**: Axios won't send auth header without this
2. **No loading state**: Show spinner while fetching
3. **No error handling**: Handle network failures gracefully
4. **Missing userId for /user endpoint**: Need to decode JWT to get userId
5. **Over-fetching**: Don't call /user endpoint if not logged in

---

## Next: Create LeaderboardPage

See 02-PLAN.md for implementation tasks.
