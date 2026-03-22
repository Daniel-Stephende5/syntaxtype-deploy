# Phase 2: Leaderboard Frontend - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Build user-facing leaderboard page showing best scores per game with filtering and sorting. This phase delivers the React frontend component. The backend API is Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Layout & Visual Design
- Table layout (card/better styling pushed to v2)
- Medal/trophy icons for top 3 ranks (gold/silver/bronze)
- Current user's row highlighted with combined styling (background color + border)
- Columns: Rank, Username, WPM, Accuracy, Combined Score, Game, Date
- Full date format (e.g., "Mar 23, 2026")
- Combined score is primary metric but displayed in standard column (not emphasized)

### Metric Toggle UI (WPM/Accuracy/Combined)
- Segmented button group style
- Positioned at top of page, separate section from filters
- Active state indicated with color + icon (combined active state)
- Tooltip explanation for Combined Score formula on hover
- "Sort by:" label that updates dynamically with selected metric
- Debounced (300ms delay before API call)

### Best/Recent Toggle
- Toggle switch component
- Positioned above table with filters
- Labels: "All-time | Recent" (switches based on state)
- Shows count: "Recent (10 games)"
- Affects entire leaderboard (not just personal stats)
- State remembered in localStorage across sessions
- Debounced (300ms delay before API call)

### Loading & Empty States
- Spinner loading indicator (not skeleton)
- Encouraging empty state message: "No scores yet. Play a game to get on the board!"
- Error state auto-retries after 5 seconds
- Refresh button for manual refresh
- Guest users see leaderboard with fixed top banner prompting "Register" and "Login" buttons

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AuthUtils.js`: getAuthToken(), subscribeToAuthChanges() for auth state
- `Navbar.js`: Navigation patterns, route structure
- `App.js`: Route definitions using react-router-dom v6
- Existing pages use MUI components (AppBar, Box, Button, etc.)

### Established Patterns
- React Router v6 with Routes/Route
- ProtectedRoute and PublicOnlyRoute wrappers for auth
- Axios for API calls (via AuthUtils setAuthToken)
- MUI components for UI

### Integration Points
- New route: `/leaderboard` in App.js
- New component: `pages/LeaderboardPage.js`
- API endpoints: `/api/leaderboards/global`, `/api/leaderboards/game/{category}`, `/api/leaderboards/user/{userId}`
- Navbar needs link to leaderboard page

</code_context>

<specifics>
## Specific Ideas

- Simple table layout first, better styling in v2
- Medal/trophy icons for top 3 for gamification feel
- Combined styling (background + border) for current user highlight
- Debounced toggles to prevent rapid API calls
- Auto-retry on errors for better UX

</specifics>

<deferred>
## Deferred Ideas

- Card-based layout (v2)
- Better visual styling (v2)
- Skeleton loader (v2)
- Pull to refresh on mobile (v2)
- Cursor pagination (from Phase 1 deferred)
- Real-time leaderboard updates via WebSocket (from Phase 1 deferred)

</deferred>

---

*Phase: 02-leaderboard-frontend*
*Context gathered: 2026-03-23*
