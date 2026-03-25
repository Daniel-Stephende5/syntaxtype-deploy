# Phase 3c Plan: Final Cleanup & E2E Tests

**Phase:** 3c  
**Name:** Final Cleanup & E2E Tests  
**Status:** Planning  
**Created:** 2026-03-25

---

## Overview

Final round of fixes from Gemini Code Assist review. Complete hook application to remaining games and solidify automated test coverage for score submission functionality.

---

## Issues Summary

| Priority | File | Issue |
|----------|------|-------|
| HIGH | `package-lock.json:28` | React version downgrade - confirm intentional |
| HIGH | `FallingTypingTest.js:146` | `submitScore` duplicated - should use hook |
| HIGH | `GalaxyMainGame.js:107` | `submitScore` duplicated - should use hook |
| HIGH | `TypingTest.js:332` | `submitScore` duplicated - should use hook |
| MEDIUM | `03-VALIDATION.md:44` | E2E tests marked "needs check" - define automated verification |

---

## Tasks

### HIGH Priority

#### H1: Confirm React Version Downgrade
**File:** `frontend/package-lock.json`

**Issue:** React downgraded from 19.1.0 to 18.2.0, react-router-dom from 7.6.0 to 6.14.1.

**Action:** 
1. Check `package.json` to see what versions are specified
2. If versions in package.json are correct (e.g., `"react": "^18.2.0"`), the lock file is correct
3. If versions in package.json show 19/7, update them to reflect desired versions
4. Add comment explaining why downgrade is intentional (if it is)

**Decision needed:** Was the React 19/React Router 7 upgrade intentional? If not, document that these versions should be used going forward.

#### H2: Apply useScoreSubmission Hook to Remaining Games

**Issue:** 3 games still have inline `submitScore` logic instead of using the shared hook.

**Files to update:**
1. `frontend/src/pages/TypingTest.js`
2. `frontend/src/pages/FallingTypingTest.js`
3. `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

**Changes per file:**
1. Add import: `import { useScoreSubmission } from '../hooks/useScoreSubmission';`
2. Add hook call: `const { submitScore, isSubmitting, submitMessage, submitSuccess, snackbarOpen, setSnackbarOpen } = useScoreSubmission();`
3. Replace inline submission logic with `submitScore('CATEGORY', payload)`
4. Remove old state variables (isSubmitting, submitMessage, submitSuccess, etc.)
5. Remove inline submitScore function

**Payload examples:**
- TypingTest: `{ wpm, accuracy, score }`
- FallingTypingTest: `{ wpm, accuracy, score }`
- GalaxyMainGame: `{ score: gameScore }`

### MEDIUM Priority

#### M1: Solidify E2E Tests for Score Submission
**File:** `.planning/phases/03-game-score-integration/03-VALIDATION.md`

**Issue:** E2E tests marked as "needs check" - automated verification not fully defined.

**Action:**
1. Read the validation document to identify which tests need definition
2. For each "needs check" item, define concrete automated test scenarios
3. Create test stubs or describe the test approach

**Test scenarios to define:**

```markdown
### SCORE-01: TypingTest Score Submission
**Test:** Submit score from TypingTest with valid JWT
**Steps:**
1. Login as test user
2. Navigate to TypingTest
3. Complete a typing challenge
4. Click submit score
5. Verify response includes isNewBest or rank

### SCORE-02: FallingTypingTest Score Submission
**Test:** Submit score from FallingTypingTest
**Steps:**
1. Navigate to FallingTypingTest
2. Play until game over
3. Submit score
4. Verify leaderboard updated

### SCORE-03 to SCORE-09:**
(Similar pattern for each game)
```

**Or create actual test file:** `frontend/cypress/e2e/score-submission.cy.js`

---

## Execution Order

1. H1 (Confirm React versions)
2. H2 (Apply hook to 3 games)
3. M1 (Define E2E tests)

---

## Files Modified

**Frontend - Modified:**
- `frontend/package.json` (if version correction needed)
- `frontend/package-lock.json`
- `frontend/src/pages/TypingTest.js`
- `frontend/src/pages/FallingTypingTest.js`
- `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

**Planning - Modified:**
- `.planning/phases/03-game-score-integration/03-VALIDATION.md`

**Frontend - New (optional):**
- `frontend/cypress/e2e/score-submission.cy.js`

---

## Success Criteria

1. All 8 games use the shared `useScoreSubmission` hook
2. React version concerns addressed (confirmed intentional or corrected)
3. E2E test scenarios defined for all score submission functionality
4. Frontend builds successfully
5. No more duplicate submitScore logic across games
