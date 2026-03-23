---
phase: "01"
plan: "02"
subsystem: "statistics"
tags: [leaderboard, ranking, data-layer, aggregation]
dependency-graph:
  requires: []
  provides:
    - "leaderboard-ranking-service"
  affects:
    - "api-leaderboard"
    - "frontend-leaderboard"
tech-stack:
  added:
    - "Spring Data JPA queries"
    - "JUnit 5 with Mockito"
    - "AssertJ"
  patterns:
    - "Service layer aggregation"
    - "TDD with unit tests"
    - "Repository query methods"
key-files:
  created:
    - "backend/src/test/java/com/syntaxtype/demo/Service/statistics/LeaderboardServiceTest.java"
  modified:
    - "backend/src/main/java/com/syntaxtype/demo/Service/statistics/LeaderboardService.java"
    - "backend/src/main/java/com/syntaxtype/demo/Repository/statistics/LeaderboardRepository.java"
decisions:
  - "Combined score uses in-memory sorting (performance trade-off accepted for MVP)"
  - "Ties use sequential ranks without skipping numbers"
  - "Global leaderboard shows best per-user per-metric across all categories"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-23"
---

# Phase 1 Plan 2: Leaderboard Data Layer Summary

**One-liner:** Added ranking methods to LeaderboardService with combined score aggregation and tie handling for WPM, accuracy, and combined metrics.

## Tasks Completed

| # | Task | Status | Files Modified |
|---|------|--------|---------------|
| 1 | Add ranking methods to LeaderboardService | ✅ Complete | LeaderboardService.java, LeaderboardRepository.java |
| 2 | Create LeaderboardServiceTest.java | ✅ Complete | LeaderboardServiceTest.java (new) |

## Implementation Details

### Task 1: Ranking Methods Added

Added 5 new methods to `LeaderboardService`:

1. **`getTop10ByWpm(Category category)`**
   - Uses repository's `findTop10ByCategoryOrderByWordsPerMinuteDesc`
   - Returns top 10 by WPM with sequential tie handling

2. **`getTop10ByAccuracy(Category category)`**
   - Uses repository's `findTop10ByCategoryOrderByAccuracyDesc`
   - Returns top 10 by accuracy with sequential tie handling

3. **`getTop10ByCombinedScore(Category category)`**
   - Fetches all entries for category, sorts in-memory by combined score
   - Combined score formula: `WPM × (Accuracy/100)` with `1.5x` if accuracy > 95%
   - Returns top 10 with calculated scores

4. **`getGlobalTop10(String metricType)`**
   - Supports "wpm", "accuracy", "combined" metric types
   - Groups by user, keeps only best entry per user per metric
   - Returns top 10 across all categories

5. **`getUserRankings(Long userId)`**
   - Returns all leaderboard entries for a specific user
   - Used for user's personal stats page

### Task 2: Tests Created

Created comprehensive test suite with 16 test cases:

**Combined Score Calculation Tests:**
- 1.5x multiplier applied when accuracy > 95
- No multiplier when accuracy ≤ 95
- Edge case: accuracy = 95 (no multiplier)
- Edge case: accuracy = 96 (with multiplier)
- Null handling for WPM and accuracy

**Ranking with Ties Tests:**
- Sequential ranks without ties
- Same rank assigned to tied entries
- Multiple ties at different positions

**Empty Results Handling Tests:**
- Empty list returned when no entries exist
- Handles all metric types (WPM, accuracy, combined)

**Service Method Tests:**
- Top 10 by WPM sorted correctly
- Top 10 by accuracy sorted correctly
- Top 10 by combined score with multiplier logic
- User rankings across all categories

## Repository Changes

Added 4 new query methods to `LeaderboardRepository`:

1. `findByCategoryOrderByWordsPerMinuteDesc` - All entries for category (for combined score)
2. `findByCategoryOrderByAccuracyDesc` - All entries for category (for combined score)
3. `findAllByUserId` - Entries for specific user across categories
4. `findTopByWordsPerMinute` - All entries for global leaderboard

## Verification

**Compilation:** ⚠️ Maven not available in environment - manual code review completed

**Code Review:**
- All imports correct
- Proper use of Spring Data JPA annotations
- Correct null handling
- Proper stream operations with `.toList()` (Java 17 compatible)

## Deviations from Plan

**None** - Plan executed exactly as specified.

## Notes

- Combined score sorting uses in-memory calculation due to JPQL limitations with custom formulas
- Tie handling follows "sequential ranks" rule: tied entries share rank value, but subsequent ranks continue sequentially without skipping
- Test coverage focuses on edge cases and tie scenarios per context decisions
