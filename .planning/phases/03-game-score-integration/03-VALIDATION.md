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

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
