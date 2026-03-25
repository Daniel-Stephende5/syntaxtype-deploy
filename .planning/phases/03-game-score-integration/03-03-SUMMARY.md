---
phase: 03-game-score-integration
plan: 03
subsystem: leaderboard
tags:
  - frontend
  - score-submission
  - leaderboard
  - non-typing-games
dependency_graph:
  requires:
    - 03-01
    - 03-02
  provides:
    - Score submission for Galaxy, Grid, Bookworm, Crossword, FourPics, SyntaxSaver
  affects:
    - LeaderboardPage.js
tech_stack:
  added:
    - fetch API calls to POST /api/scores/{category}
    - JWT authentication via getAuthToken
    - Loading/success/error state management
    - Score tracking for FourPicsGame
  patterns:
    - Manual "Submit to Leaderboard" button after game completion
    - Loading spinner during submission
    - Retry on failure with error message
    - Login prompt if not authenticated
key_files:
  created: []
  modified:
    - frontend/src/pages/GalaxyGame/GalaxyMainGame.js
    - frontend/src/pages/GridGame.js
    - frontend/src/pages/Bookworm.js
    - frontend/src/pages/CrosswordGame.js
    - frontend/src/pages/FourPicsGame.js
    - frontend/src/pages/SyntaxSaverLesson.js
decisions:
  - Used existing API_BASE from utils/api
  - Used getAuthToken from utils/AuthUtils for JWT retrieval
  - Implemented score tracking in FourPicsGame (was missing)
  - Non-typing games send wpm: 0, accuracy: 100 as specified
metrics:
  duration: ~30 min
  tasks: 3
  files: 6
  completion_date: 2026-03-25
---

# Phase 3 Plan 3: Non-Typing Games Leaderboard Integration Summary

## Overview
Integrated all 6 non-typing games with the leaderboard system, implementing score submission to the backend `/api/scores/{category}` endpoint.

## Games Integrated

| Game | Category | Score Tracking | Status |
|------|----------|----------------|--------|
| GalaxyMainGame.js | GALAXY | Already existed | ✅ Complete |
| GridGame.js | GRID | Added | ✅ Complete |
| Bookworm.js | BOOKWORM | Already existed | ✅ Complete |
| CrosswordGame.js | CROSSWORD | Already existed | ✅ Complete |
| FourPicsGame.js | FOUR_PICS | Implemented | ✅ Complete |
| SyntaxSaverLesson.js | SYNTAX_SAVER | Already existed | ✅ Complete |

## Implementation Details

### Task 1: GalaxyMainGame.js
- Added imports for `getAuthToken` and `API_BASE`
- Added score submission state variables
- Created `submitScore()` function that:
  - Gets JWT from localStorage via getAuthToken
  - POSTs to `/api/scores/GALAXY` with `{wpm: 0, accuracy: 100, score: scoreRef.current}`
  - Shows loading spinner during submission
  - Displays success/error message
- Updated game over screen to show "Submit to Leaderboard" button alongside "REDEPLOY"

### Task 2: GridGame.js
- Added imports for `getAuthToken` and `API_BASE`
- Added score tracking (score, gameOver, showSubmitButton states)
- Implemented score calculation:
  - Win: 100 + difficulty bonus (Easy: 20, Normal: 30, Hard: 50)
  - Lose: difficulty bonus + (remaining hearts × 10)
- Added score display and "Submit to Leaderboard" button
- Created submitScore() function similar to GalaxyMainGame

### Task 3: Bookworm.js
- Added imports for `getAuthToken` and `API_BASE`
- Show submit button when score >= 200 or 10 words found
- Added inline submit handler in the stats panel

### Task 4: CrosswordGame.js
- Added imports for `getAuthToken` and `API_BASE`
- Show submit button when puzzle is completed (all cells filled)
- Added button next to "New Puzzle" button in controls

### Task 5: FourPicsGame.js
- Added imports for `getAuthToken` and `API_BASE`
- Score was already partially implemented (+10 per correct answer, -2 per hint)
- Enhanced with `isGameComplete` state and proper leaderboard submission
- Added proper "Submit to Leaderboard" button after game completion

### Task 6: SyntaxSaverLesson.js
- Added import for `getAuthToken`
- Added `isLessonComplete` state
- Show submit button when lesson is complete
- Submit button appears with score display

## Payload Format
All games submit the same payload format as specified:
```json
{
  "wpm": 0,
  "accuracy": 100,
  "score": <game_score>
}
```

## User Experience
- All games show a "Submit to Leaderboard" button after game completion
- Loading state shows "Submitting score..." text
- Success shows rank message (e.g., "Score submitted! Rank: 5")
- Error shows failure message with option to retry
- If not logged in, shows "Please login to save your score to the leaderboard"

## Deviation from Original Plan
- **File paths**: The plan specified paths under `src/components/games/` but actual files are in `src/pages/`. This was adjusted during implementation to match the actual codebase structure.

## Verification
```bash
grep -E "api/scores/(GALAXY|GRID|BOOKWORM|CROSSWORD|FOUR_PICS|SYNTAX_SAVER)" \
  frontend/src/pages/GalaxyGame/GalaxyMainGame.js \
  frontend/src/pages/GridGame.js \
  frontend/src/pages/Bookworm.js \
  frontend/src/pages/CrosswordGame.js \
  frontend/src/pages/FourPicsGame.js \
  frontend/src/pages/SyntaxSaverLesson.js
```
Result: All 6 games have correct endpoint calls.