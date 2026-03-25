---
phase: "03"
plan: "02"
subsystem: "frontend"
tags: [leaderboard, games, integration, auth]
dependency-graph:
  requires:
    - "03-01 - Backend unified score endpoint"
  provides:
    - "SCORE-01 - Typing test score submission"
    - "SCORE-02 - Falling words score submission"
  affects:
    - "frontend/src/pages/TypingTest.js"
    - "frontend/src/pages/FallingTypingTest.js"
tech-stack:
  added: [MUI CircularProgress, MUI Button, MUI Snackbar, MUI Alert]
  patterns: [JWT auth via localStorage, manual submission flow, retry pattern]
key-files:
  created: []
  modified:
    - "frontend/src/pages/TypingTest.js"
    - "frontend/src/pages/FallingTypingTest.js"
decisions:
  - "Manual submit button instead of auto-submit (user choice)"
  - "JWT token retrieved from localStorage using getAuthToken utility"
  - "Falling game uses 100% accuracy as placeholder (needs keystroke tracking)"
key-metrics:
  completion-date: "2026-03-25"
  tasks-completed: 2
---

# Phase 3 Plan 02: Typing Games Leaderboard Integration

## Summary

Added leaderboard submission functionality to TypingTest.js and FallingTypingTest.js with manual submit button, JWT authentication, loading spinner, and retry capability.

## Tasks Completed

### Task 1: Update TypingTest.js

**Changes:**
- Added MUI imports (CircularProgress, Button, Snackbar, Alert)
- Imported `getAuthToken` from AuthUtils
- Added leaderboard submission state variables
- Created `submitScore()` function:
  - Gets JWT from localStorage
  - Shows "Please login" message if no token
  - POSTs to `/api/scores/TYPING_TESTS` with {wpm, accuracy, score}
  - Shows loading spinner during submission
  - Displays success/error via Snackbar
  - Hides submit button on success, allows retry
- Added "Submit to Leaderboard" button after test completion
- Added "Retry" button to restart the test
- Added Snackbar for feedback messages

**Files modified:** `frontend/src/pages/TypingTest.js`

### Task 2: Update FallingTypingTest.js

**Changes:**
- Added MUI imports (CircularProgress, Button, Snackbar, Alert)
- Imported `getAuthToken` from AuthUtils
- Added leaderboard submission state variables (including gameWpm, gameAccuracy)
- Modified game over effect to calculate WPM and show submit button
- Created `submitScore()` function same pattern as TypingTest.js
- Updated game over modal with:
  - Display of Score, WPM, Accuracy
  - "Submit to Leaderboard" button with spinner
  - "Play Again" button (replaces "Restart")
- Added Snackbar for feedback messages
- Updated handleRestart to reset submission state

**Files modified:** `frontend/src/pages/FallingTypingTest.js`

## Deviations from Plan

None - plan executed exactly as written.

## Notes

- Accuracy in FallingTypingTest uses 100% as placeholder since keystroke tracking is not implemented. This could be enhanced in a future iteration.
- The submission endpoints expect the format from plan 03-01 (POST /api/scores/{category} with {wpm, accuracy, score})
- MUI components were used for consistency with the design system

## Verification

To verify:
1. Complete a typing test in TypingTest.js
2. After submission, click "Submit to Leaderboard"
3. If logged in: score submits, success message shown
4. If not logged in: "Please login" message shown
5. Same verification for FallingTypingTest.js game completion
