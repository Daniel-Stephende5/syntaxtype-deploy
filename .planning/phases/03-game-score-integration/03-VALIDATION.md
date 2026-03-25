---
phase: 3
slug: game-score-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (existing in project) |
| **Config file** | package.json jest config |
| **Quick run command** | `npm test -- --testPathPattern="Score|Leaderboard" --passWithNoTests` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="Score|Leaderboard" --passWithNoTests`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | SCORE-09 | unit | `npm test -- --testPathPattern="LeaderboardService" --passWithNoTests` | ✅ | ⬜ pending |
| 3-01-02 | 01 | 1 | SCORE-01 | e2e | `npm test -- --testPathPattern="TypingTest" --passWithNoTests` | ⚠️ needs check | ⬜ pending |
| 3-02-01 | 02 | 1 | SCORE-03,04,05,06 | e2e | `npm test -- --testPathPattern="Galaxy|Grid|Bookworm|Crossword" --passWithNoTests` | ⚠️ needs check | ⬜ pending |
| 3-03-01 | 03 | 1 | SCORE-07,08 | e2e | `npm test -- --testPathPattern="FourPics|SyntaxSaver" --passWithNoTests` | ⚠️ needs check | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Check existing test files in `src/__tests__/` or `src/test/` for Score/Leaderboard tests
- [ ] If none exist, create basic test stubs for ScoreController and LeaderboardService

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Play each game and verify score appears on leaderboard | SCORE-01 to SCORE-08 | Requires human gameplay | 1) Play game, 2) Submit score, 3) Check /leaderboard page |
| Four Pics score tracking works | SCORE-07 | UI behavior | Play Four Pics, complete puzzle, verify score displays |

---

## E2E Test Scenarios for Score Submission

### SCORE-01: TypingTest Score Submission

**Type:** e2e

**Test Case:** Submit score from TypingTest with valid authentication
1. Login as test user (or use existing authenticated session)
2. Navigate to `/typing-test`
3. Complete typing test with known WPM and accuracy
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/typing`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows appropriate message ("Score submitted!" or "New best score!")
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/typing-test` as guest (no auth token)
2. Complete typing test
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit score when already have best score
1. Login as user with existing TypingTest best score
2. Complete game with lower WPM/accuracy
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-02: FallingTypingTest Score Submission

**Type:** e2e

**Test Case:** Submit score from FallingTypingTest with valid authentication
1. Login as test user
2. Navigate to `/falling-typing`
3. Complete game (survive duration or reach target)
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/falling-typing`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/falling-typing` as guest
2. Complete game
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing FallingTypingTest best score
2. Complete game with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-03: Galaxy Score Submission

**Type:** e2e

**Test Case:** Submit score from Galaxy game with valid authentication
1. Login as test user
2. Navigate to `/galaxy`
3. Complete game (reach wave/level target)
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/galaxy`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/galaxy` as guest
2. Complete game
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing Galaxy best score
2. Complete game with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-04: Grid Score Submission

**Type:** e2e

**Test Case:** Submit score from Grid game with valid authentication
1. Login as test user
2. Navigate to `/grid`
3. Complete grid puzzle within time limit
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/grid`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/grid` as guest
2. Complete puzzle
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing Grid best score
2. Complete puzzle with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-05: Bookworm Score Submission

**Type:** e2e

**Test Case:** Submit score from Bookworm game with valid authentication
1. Login as test user
2. Navigate to `/bookworm`
3. Complete reading challenge
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/bookworm`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/bookworm` as guest
2. Complete challenge
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing Bookworm best score
2. Complete with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-06: Crossword Score Submission

**Type:** e2e

**Test Case:** Submit score from Crossword game with valid authentication
1. Login as test user
2. Navigate to `/crossword`
3. Complete crossword puzzle
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/crossword`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/crossword` as guest
2. Complete puzzle
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing Crossword best score
2. Complete puzzle with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-07: FourPics Score Submission

**Type:** e2e

**Test Case:** Submit score from FourPics game with valid authentication
1. Login as test user
2. Navigate to `/four-pics`
3. Complete picture puzzle
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/four-pics`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/four-pics` as guest
2. Complete puzzle
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing FourPics best score
2. Complete with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

### SCORE-08: SyntaxSaver Score Submission

**Type:** e2e

**Test Case:** Submit score from SyntaxSaver game with valid authentication
1. Login as test user
2. Navigate to `/syntax-safer`
3. Complete syntax challenge
4. Click "Submit to Leaderboard" button
5. Verify:
   - API request sent to `/api/scores/syntax-safer`
   - Response includes `{success: true, isNewBest: boolean, rank: number}`
   - UI shows success message
   - Leaderboard page shows updated entry

**Test Case:** Submit score without authentication
1. Navigate to `/syntax-safer` as guest
2. Complete challenge
3. Click "Submit to Leaderboard"
4. Verify redirect to login or error message

**Test Case:** Submit lower score with existing best
1. Login as user with existing SyntaxSaver best score
2. Complete with lower score
3. Submit score
4. Verify: `isNewBest` is false, rank unchanged

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
