# Phase 3a Plan: Bug Fixes & Code Quality

**Phase:** 3a  
**Name:** Bug Fixes & Code Quality  
**Status:** Planning  
**Created:** 2026-03-25

---

## Overview

Address code review issues identified by Gemini Code Assist on PR #2. Fixes include data integrity, calculation accuracy, performance optimization, and code quality improvements.

---

## Issues Summary

| Priority | File | Issue |
|----------|------|-------|
| HIGH | `ScoreController.java:103` | Score not associated with user |
| HIGH | `FallingTypingTest.js:84` | Accuracy hardcoded to 100% |
| HIGH | `TypingTest.js:285` | `replace("___")` only replaces first occurrence |
| HIGH | `TypingTest.js:317` | Frontend expects wrong response fields |
| MEDIUM | `LeaderboardService.java:364` | Inefficient query (filter in memory) |
| MEDIUM | `LeaderboardService.java:380` | `totalWordsTyped` misused for raw scores |
| MEDIUM | `LeaderboardService.java:420` | Generic exception catch without logging |
| MEDIUM | `LeaderboardService.java:461` | `calculateRankForUser` fetches all then sorts |
| MEDIUM | `GalaxyMainGame.js:376` | `window.location.reload()` bad UX |

---

## Tasks

### HIGH Priority

#### H1: Associate Score with User (Backend)
**File:** `backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java`

**Change:** Add `score.setUser(userDetails.getUser())` before `scoreService.saveScore(score)`

#### H2: Fix FallingTypingTest Accuracy (Frontend)
**File:** `frontend/src/pages/FallingTypingTest.js`

**Problem:** Accuracy hardcoded to 100% on line 84

**Solution:** Track correct/incorrect keystrokes during gameplay:
- Add `correctChars` and `totalTypedChars` state
- Update on each keystroke
- Calculate accuracy: `(correctChars / totalTypedChars) * 100`

#### H3: Fix Multiple Blank Replacement (Frontend)
**File:** `frontend/src/pages/TypingTest.js`

**Problem:** `fullExpected.replace("___", answer)` only replaces first occurrence

**Solution:** Use regex with global flag or split/join:
```javascript
const parts = selectedChallenge.code.split('___');
let fullExpected = parts[0];
selectedChallenge.answers.forEach((answer, i) => {
  fullExpected += answer + (parts[i + 1] || '');
});
```

#### H4: Fix Response Handling (Frontend)
**File:** `frontend/src/pages/TypingTest.js` (and all game files)

**Problem:** Frontend expects `data.message` but backend returns `{success, isNewBest, rank}`

**Solution:** Update all game components to use new response format:
```javascript
const data = await response.json();
setSubmitSuccess(true);
let successMessage = "Score submitted!";
if (data.isNewBest) {
  successMessage = "New best score!";
}
if (data.rank) {
  successMessage += ` Your rank is #${data.rank}.`;
}
setSubmitMessage(successMessage);
```

**Files to update:**
- `TypingTest.js`
- `FallingTypingTest.js`
- `GalaxyMainGame.js`
- `GridGame.js`
- `Bookworm.js`
- `CrosswordGame.js`
- `FourPicsGame.js`
- `SyntaxSaverLesson.js`

---

### MEDIUM Priority

#### M1: Optimize LeaderboardRepository Query (Backend)
**File:** `backend/src/main/java/com/syntaxtype/demo/Repository/statistics/LeaderboardRepository.java`

**Change:** Add method `findByUserAndCategory(User user, Category category)`

```java
Optional<Leaderboard> findByUserAndCategory(User user, Category category);
```

**File:** `backend/src/main/java/com/syntaxtype/demo/Service/statistics/LeaderboardService.java`

**Change:** Replace stream/filter with direct query call.

#### M2: Add Score Field to Leaderboard (Backend)
**File:** `backend/src/main/java/com/syntaxtype/demo/Entity/statistics/Leaderboard.java`

**Change:** Add `Integer score` field with getter/setter

**File:** `LeaderboardService.java`

**Change:** Use `leaderboard.getScore()` instead of `leaderboard.getTotalWordsTyped()` for non-typing games

**Note:** This is a schema change - may require migration.

#### M3: Add Logging to Exception Handler (Backend)
**File:** `backend/src/main/java/com/syntaxtype/demo/Service/statistics/LeaderboardService.java`

**Change:** Inject Logger and log exception:
```java
private static final Logger log = LoggerFactory.getLogger(LeaderboardService.class);
// In catch block:
log.error("Failed to update leaderboard for user {} and category {}", username, category, e);
```

#### M4: Optimize Rank Calculation (Backend)
**File:** `LeaderboardService.java`

**Change:** Use native query with window function or improve sorting:
```java
@Query(value = "SELECT * FROM leaderboard WHERE category = :category ORDER BY ... LIMIT 1000", nativeQuery = true)
```

Better: Add database index and let repository handle sorting efficiently.

#### M5: Replace window.location.reload() (Frontend)
**File:** `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

**Change:** Implement state reset function:
```javascript
const restartGame = () => {
  setScore(0);
  setLives(3);
  setIsGameOver(false);
  setShowSubmitButton(false);
  // Reset other game state variables
};
```

---

## Execution Order

1. H1 (Backend - quick fix)
2. H2 (FallingTypingTest - accuracy tracking)
3. H3 (TypingTest - multiple blanks)
4. H4 (All games - response handling) 
5. M1 (Repository optimization)
6. M2 (Score field - schema change)
7. M3 (Logging)
8. M4 (Rank calculation optimization)
9. M5 (Galaxy restart function)

---

## Validation

1. Build backend: `cd backend && mvn compile`
2. Build frontend: `cd frontend && npm run build`
3. Manual test:
   - Submit score from any game → Score appears in database with correct user
   - Typing test with multiple blanks → Correct accuracy calculated
   - Falling typing → Accuracy reflects actual keystrokes
   - Galaxy restart → No page refresh

---

## Files Modified

**Backend:**
- `Controller/lessons/ScoreController.java`
- `Repository/statistics/LeaderboardRepository.java`
- `Service/statistics/LeaderboardService.java`
- `Entity/statistics/Leaderboard.java` (may add field)

**Frontend:**
- `pages/TypingTest.js`
- `pages/FallingTypingTest.js`
- `pages/GalaxyGame/GalaxyMainGame.js`
- `pages/GridGame.js`
- `pages/Bookworm.js`
- `pages/CrosswordGame.js`
- `pages/FourPicsGame.js`
- `pages/SyntaxSaverLesson.js`

---

## Success Criteria

1. Score submissions are correctly associated with user
2. Accuracy calculations are correct for all typing games
3. Multiple blanks in challenges are handled correctly
4. All frontend components handle new response format
5. Leaderboard queries are optimized
6. No generic exception catching without logging
7. Galaxy game restarts without page refresh
