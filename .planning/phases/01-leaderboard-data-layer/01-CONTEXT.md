# Phase 1: Leaderboard Data Layer - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Create backend infrastructure to track and retrieve best scores for each player across all games. This phase delivers the data layer and API endpoints for leaderboards. The frontend leaderboard page is Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Ranking Metric
- Three metrics available: WPM, Accuracy, Combined Score
- Combined score formula: WPM × (Accuracy/100) × 1.5 if accuracy > 95%
- Single leaderboard with user toggle between WPM/Accuracy/Combined views
- Score calculation: Toggle between all-time best OR average of 10 most recent sessions
- Default view: all-time best
- Toggle affects global ranking (not just personal stats)

### Data Model
- Hybrid approach: Keep existing Leaderboard entity for rankings, add session history
- Add JSON array field (recentGames) to existing Leaderboard table for session history
- Store entire history if possible, with selectable window (N sessions) when viewing history
- Use existing categories: CHALLENGES, TYPING_TESTS, FALLING_WORDS, CROSSWORD, GALAXY, OVERALL
- OVERALL calculation: Best per metric (WPM, Accuracy, Combined) from any game (shows versatility)

### Global Leaderboard
- Combined leaderboard view with filter dropdown (not tabs)
- Include OVERALL as a filter option
- Paginated with 10 entries per page
- Use offset pagination (for user testing before committing to cursor pagination)
- Sequential ranks for ties (not same rank numbers)

### API Response Format
- Fields per entry: rank, username, score, accuracy, WPM, gameName, dateAchieved
- Separate endpoint for user's own rank/stats (leaner main endpoint)
- Cache responses for 1 minute
- Public endpoints (no auth required)
- Prompt unauthenticated users to register for personalized stats

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Leaderboard` entity: Already exists at `Entity/Statistics/Leaderboard.java` with user, WPM, accuracy, totalWordsTyped, totalTimeSpent, category
- `LeaderboardService`: Basic CRUD service already exists
- `LeaderboardRepository`: Basic JPA repository with findByCategory support
- `Category` enum: CHALLENGES, TYPING_TESTS, FALLING_WORDS, CROSSWORD, GALAXY, OVERALL

### Established Patterns
- Repository extends JpaRepository with custom query methods
- DTOs use Lombok @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor
- Services use constructor injection with @AllArgsConstructor

### Integration Points
- New endpoints: `/api/leaderboard/global`, `/api/leaderboard/game/{category}`, `/api/leaderboard/user/{userId}`
- Games save scores via ScoringService.save() - will need to also save to Leaderboard
- Frontend will call these endpoints (Phase 2)

</code_context>

<specifics>
## Specific Ideas

- Cursor pagination may be considered later after user testing confirms offset pagination issues with frequently changing leaderboard data
- JSON array for session history allows flexible querying without schema changes
- 1-minute cache provides balance between freshness and performance

</specifics>

<deferred>
## Deferred Ideas

- Cursor-based pagination for leaderboards (after user testing)
- User-specific leaderboard customization (showing only friends, etc.)
- Achievement badges tied to leaderboard milestones
- Real-time leaderboard updates via WebSocket

</deferred>

---

*Phase: 01-leaderboard-data-layer*
*Context gathered: 2026-03-23*
