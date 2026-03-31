---
phase: 04A-teacher-dashboard-bugfixes
plan: '03'
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/pages/LeaderboardPage.js
  - frontend/src/pages/TeacherDashboard.js
  - frontend/src/pages/PersonalStatsDashboard.js
autonomous: true
requirements: []
---

<objective>
Add manual and auto-refresh functionality to all leaderboards with user-friendly features: refresh buttons at top/bottom, toggle for auto-refresh, "last updated" timestamp, loading indicator, and intelligent pause behavior.
</objective>

<context>
@frontend/src/pages/LeaderboardPage.js
@frontend/src/pages/TeacherDashboard.js
@frontend/src/pages/PersonalStatsDashboard.js
</context>

<tasks>

<task type="auto">
  <name>task 1: Add refresh state and utilities to LeaderboardPage</name>
  <files>frontend/src/pages/LeaderboardPage.js</files>
  <action>
Add state variables:
- lastUpdated: timestamp of last refresh
- autoRefresh: boolean (default true)
- isRefreshing: boolean for loading indicator
- refreshInterval: ref to store interval ID

Add functions:
- handleRefresh(): updates lastUpdated, shows loading, fetches data
- toggleAutoRefresh(): enable/disable auto-refresh
- useEffect for auto-refresh interval (30 seconds)
- useEffect for visibility API (pause when tab inactive)
- Check if user is viewing specific rank (has expanded row) before auto-refresh
  </action>
  <verify>
<manual>Open leaderboard, verify refresh button and timestamp visible</manual>
  <done>LeaderboardPage has refresh controls</done>
</task>

<task type="auto">
  <name>task 2: Add refresh buttons to LeaderboardPage UI</name>
  <files>frontend/src/pages/LeaderboardPage.js</files>
  <action>
Add RefreshButton component (MUI IconButton with RefreshIcon) at:
1. Top of page (above table, near metric toggle)
2. Bottom of table (below table)

Add AutoRefreshToggle: Switch or Checkbox to enable/disable auto-refresh
Add LastUpdated: Typography showing "Last updated: HH:MM:SS"

Wrap fetchLeaderboard with isRefreshing state for loading indicator.
  </action>
  <verify>
<manual>Verify buttons appear at top and bottom, timestamp updates on refresh</manual>
  <done>Refresh buttons visible at top and bottom with timestamp</done>
</task>

<task type="auto">
  <name>task 3: Add refresh functionality to TeacherDashboard</name>
  <files>frontend/src/pages/TeacherDashboard.js</files>
  <action>
Apply same refresh pattern to TeacherDashboard leaderboard tab:
- Add lastUpdated, autoRefresh, isRefreshing state
- Add refresh buttons at top and bottom of leaderboard table
- Add auto-refresh toggle and timestamp display
- Pause auto-refresh when tab inactive
  </action>
  <verify>
<manual>Open teacher dashboard, switch to leaderboard tab, verify refresh works</manual>
  <done>TeacherDashboard leaderboard has refresh controls</done>
</task>

<task type="auto">
  <name>task 4: Add refresh functionality to PersonalStatsDashboard</name>
  <files>frontend/src/pages/PersonalStatsDashboard.js</files>
  <action>
Apply same refresh pattern to PersonalStatsDashboard (My Stats page):
- Add lastUpdated, autoRefresh, isRefreshing state
- Add refresh buttons at top and bottom
- Add auto-refresh toggle and timestamp
- Pause auto-refresh when tab inactive
  </action>
  <verify>
<manual>Open My Stats page, verify refresh controls visible</manual>
  <done>PersonalStatsDashboard has refresh controls</done>
</task>

<task type="auto">
  <name>task 5: Create shared refresh hook</name>
  <files>frontend/src/hooks/useLeaderboardRefresh.js</files>
  <action>
Extract refresh logic into reusable hook:
```js
export const useLeaderboardRefresh = (fetchFn, options) => {
  // lastUpdated, autoRefresh, isRefreshing state
  // handleRefresh function
  // toggleAutoRefresh function
  // useEffect for interval (default 30s)
  // useEffect for visibility API
  // skipRefresh condition (expanded row check)
}
```
Use this hook in all three pages to reduce code duplication.
  </action>
  <verify>
<automated>grep -l "useLeaderboardRefresh" frontend/src/hooks/*.js</automated>
  <done>Reusable hook created and used in all pages</done>
</task>

</tasks>

<success_criteria>
- [ ] Manual refresh buttons at top and bottom of each leaderboard table
- [ ] Auto-refresh enabled by default, toggleable
- [ ] "Last updated" timestamp displayed
- [ ] Loading indicator during refresh
- [ ] Auto-refresh pauses when browser tab is inactive
- [ ] All three pages (LeaderboardPage, TeacherDashboard, PersonalStatsDashboard) have refresh
- [ ] Shared hook reduces code duplication
</success_criteria>

<notes>
- Interval: 30 seconds default
- Visibility API: document.hidden property to detect tab inactive
- Expandable rows: Deferred to future version (not implemented in current leaderboard)
</notes>