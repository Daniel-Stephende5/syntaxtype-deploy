# Phase 3b Plan: Quality Improvements

**Phase:** 3b  
**Name:** Quality Improvements  
**Status:** Planning  
**Created:** 2026-03-25

---

## Overview

Additional code quality improvements from second round of Gemini Code Assist review on PR #2. Focus on code maintainability, React best practices, and backend code cleanliness.

---

## Issues Summary

| Priority | File | Issue |
|----------|------|-------|
| HIGH | `Bookworm.js:225` | Code duplication - extract `useScoreSubmission` hook |
| HIGH | `GalaxyMainGame.js:151` | Direct DOM manipulation - use React state |
| MEDIUM | `ScoreController.java:113` | Use `Optional.ofNullable()` for cleaner null handling |
| MEDIUM | `LeaderboardService.java:467` | Redundant sorting for non-typing games |

---

## Tasks

### HIGH Priority

#### H1: Extract useScoreSubmission Hook
**File:** `frontend/src/pages/Bookworm.js` (pattern exists in all game files)

**Issue:** Score submission logic duplicated across 8 game components.

**Solution:** Create reusable custom hook:

```javascript
// hooks/useScoreSubmission.js
import { useState } from 'react';
import { getAuthToken } from '../utils/auth';

export const useScoreSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const submitScore = async (category, payload) => {
    const token = getAuthToken();
    if (!token) {
      setSubmitMessage("Please login to save your score");
      setSubmitSuccess(false);
      setSnackbarOpen(true);
      return false;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/scores/${category}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to submit score');

      const data = await response.json();
      setSubmitSuccess(true);
      let message = 'Score submitted!';
      if (data.isNewBest) message = 'New best score!';
      if (data.rank) message += ` Your rank is #${data.rank}.`;
      setSubmitMessage(message);
      setSnackbarOpen(true);
      return true;
    } catch (err) {
      setSubmitSuccess(false);
      setSubmitMessage('Failed to submit score');
      setSnackbarOpen(true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitScore, isSubmitting, submitMessage, submitSuccess, snackbarOpen, setSnackbarOpen };
};
```

**Files to update:**
1. Create `frontend/src/hooks/useScoreSubmission.js`
2. Update `Bookworm.js` to use the hook
3. Update `CrosswordGame.js` to use the hook
4. Update `GridGame.js` to use the hook
5. Update `FourPicsGame.js` to use the hook
6. Update `SyntaxSaverLesson.js` to use the hook

**Note:** TypingTest.js, FallingTypingTest.js, GalaxyMainGame.js may need separate handling due to unique UI patterns.

#### H2: Replace Direct DOM Manipulation with React State
**File:** `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

**Issue:** Functions use `document.getElementById` for score/lives display - anti-pattern in React.

**Solution:** 
1. Ensure score and lives are in React state (check if they already are)
2. Update `restartGame()` to use state setters instead of DOM manipulation
3. Update `updateScoreUI()` and `updateLivesUI()` to use state setters
4. Remove `document.getElementById` calls for UI elements

```javascript
// Current (anti-pattern)
const updateScoreUI = () => {
  const scoreEl = document.getElementById('ui-score');
  if (scoreEl) scoreEl.innerText = `SCORE: ${scoreRef.current}`;
};

// Fixed (React way)
const updateScoreUI = () => {
  setScore(scoreRef.current);
};
// Then in JSX: <div id="ui-score">SCORE: {score}</div>
```

### MEDIUM Priority

#### M1: Use Optional.ofNullable() in ScoreController
**File:** `backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java`

**Issue:** Repetitive ternary operators for null handling.

**Solution:**
```java
import java.util.Optional;

// Replace:
score.setScore(request.getScore() != null ? request.getScore() : 0);
score.setTimeInSeconds(request.getTimeSpent() != null ? request.getTimeSpent() : 0);
score.setWpm(request.getWpm() != null ? request.getWpm() : 0);

// With:
score.setScore(Optional.ofNullable(request.getScore()).orElse(0));
score.setTimeInSeconds(Optional.ofNullable(request.getTimeSpent()).orElse(0));
score.setWpm(Optional.ofNullable(request.getWpm()).orElse(0));

// For leaderboard call:
Optional.ofNullable(request.getWpm()).orElse(0),
Optional.ofNullable(request.getAccuracy()).orElse(100),
Optional.ofNullable(request.getScore()).orElse(0)
```

#### M2: Remove Redundant Sorting
**File:** `backend/src/main/java/com/syntaxtype/demo/Service/statistics/LeaderboardService.java`

**Issue:** Non-typing games entries are already sorted by DB query, but re-sorted in memory.

**Solution:**
```java
// Instead of always sorting:
List<Leaderboard> sorted = entries.stream()
    .sorted((a, b) -> {
        if (isTypingGame) {
            // Complex sort
        } else {
            // Another sort - redundant!
        }
    })
    .toList();

// Do conditional sort:
List<Leaderboard> sortedEntries;
if (isTypingGame) {
    sortedEntries = entries.stream()
        .sorted((a, b) -> {
            Double scoreA = LeaderboardEntry.calculateCombinedScore(a.getWordsPerMinute(), a.getAccuracy());
            Double scoreB = LeaderboardEntry.calculateCombinedScore(b.getWordsPerMinute(), b.getAccuracy());
            return scoreB.compareTo(scoreA);
        })
        .toList();
} else {
    sortedEntries = entries; // Already sorted by DB query
}
```

---

## Execution Order

1. H2 (GalaxyMainGame.js - DOM → State)
2. H1 (Create hook + apply to games)
3. M1 (ScoreController Optional)
4. M2 (LeaderboardService sorting)

---

## Validation

1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && mvn compile`
3. Manual test:
   - Galaxy game shows score/lives via React state
   - Score submission works across all games
   - Controller handles nulls gracefully

---

## Files Modified

**Frontend - New:**
- `src/hooks/useScoreSubmission.js`

**Frontend - Modified:**
- `pages/GalaxyGame/GalaxyMainGame.js`
- `pages/Bookworm.js`
- `pages/CrosswordGame.js`
- `pages/GridGame.js`
- `pages/FourPicsGame.js`
- `pages/SyntaxSaverLesson.js`

**Backend - Modified:**
- `Controller/lessons/ScoreController.java`
- `Service/statistics/LeaderboardService.java`

---

## Success Criteria

1. Galaxy game uses React state for UI elements
2. Score submission logic centralized in reusable hook
3. At least 4 game components use the new hook
4. ScoreController uses Optional for null handling
5. LeaderboardService only sorts when necessary
6. All builds pass
