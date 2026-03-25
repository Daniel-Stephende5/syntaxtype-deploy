# Phase 3d Plan: Rank Calculation Fix

**Phase:** 3d  
**Name:** Rank Calculation Fix  
**Status:** Planning  
**Created:** 2026-03-25

---

## Overview

Fix rank calculation for typing games using native query for combined score sorting. Current implementation fetches top 1000 by WPM then re-sorts in memory, which can miss entries.

---

## Issue Summary

| Priority | File | Issue |
|----------|------|-------|
| HIGH | `LeaderboardService.java:447` | Rank calculation may exclude valid entries for typing games |

---

## Problem

Current flow:
1. Fetch top 1000 entries sorted by WPM (database query)
2. Re-sort in memory by combined score (WPM × accuracy × 1.5 if accuracy > 95%)

**Issue:** A user with WPM=50, accuracy=98% (combined=73.5) might be excluded if all top 1000 by WPM have accuracy ≤ 95%, while a user with WPM=100, accuracy=80% (combined=80) should rank above them.

---

## Solution

Create native query in `LeaderboardRepository` to sort by combined score directly:

```java
@Query(value = "SELECT l.* FROM leaderboard l " +
       "WHERE l.category = :category " +
       "ORDER BY (CASE WHEN l.accuracy > 95 THEN l.words_per_minute * (l.accuracy / 100.0) * 1.5 " +
       "ELSE l.words_per_minute * (l.accuracy / 100.0) END) DESC", 
       nativeQuery = true)
List<Leaderboard> findTopNByCategoryOrderByCombinedScoreDesc(
    @Param("category") String category, 
    Pageable pageable);
```

Then update `LeaderboardService.calculateRankForUser()` to use this query for typing games.

---

## Tasks

### 1. Add Native Query to LeaderboardRepository
**File:** `backend/src/main/java/com/syntaxtype/demo/Repository/statistics/LeaderboardRepository.java`

**Add:**
```java
@Query(value = "SELECT l.* FROM leaderboard l " +
       "WHERE l.category = :category " +
       "ORDER BY (CASE WHEN l.accuracy > 95 THEN l.words_per_minute * (l.accuracy / 100.0) * 1.5 " +
       "ELSE l.words_per_minute * (l.accuracy / 100.0) END) DESC", 
       nativeQuery = true)
List<Leaderboard> findTopNByCategoryOrderByCombinedScoreDesc(
    @Param("category") String category, 
    Pageable pageable);
```

### 2. Update LeaderboardService
**File:** `backend/src/main/java/com/syntaxtype/demo/Service/statistics/LeaderboardService.java`

**Update `calculateRankForUser()`:**
- For typing games: Use new native query method
- For non-typing games: Keep existing query (sorted by score)

---

## Validation

1. Build backend: `cd backend && mvn compile`
2. Test scenarios:
   - Submit scores with varying WPM/accuracy combinations
   - Verify ranks are calculated correctly
   - Ensure users with high accuracy rank higher than those with low accuracy but higher WPM

---

## Success Criteria

1. Typing game rankings use combined score formula from database
2. No in-memory sorting for typing games
3. Ranks are accurate regardless of WPM/accuracy distribution
4. Backend compiles successfully
