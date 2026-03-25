# Phase 1b: Leaderboard Game Mode Expansion - Context

**Gathered:** 2026-03-25
**Status:** Complete (no implementation needed)

<domain>
## Phase Boundary

Update category enum and frontend dropdown to support all game types for the leaderboard.

</domain>

<decisions>
## Implementation Decisions

### Already Implemented
This phase was completed during roadmap updates. The following were implemented:

1. **Category enum** updated in `backend/src/main/java/com/syntaxtype/demo/Entity/Enums/Category.java`:
   - TYPING_TESTS
   - FALLING_WORDS
   - GALAXY
   - GRID
   - BOOKWORM
   - CROSSWORD
   - FOUR_PICS
   - CODE_CHALLENGES
   - MAP
   - SYNTAX_SAVER
   - CHALLENGES
   - OVERALL

2. **LeaderboardPage.js** game filter updated with all 11 categories:
   ```javascript
   const GAME_OPTIONS = [
     { value: "", label: "All Games" },
     { value: "TYPING_TESTS", label: "Typing Test" },
     { value: "FALLING_WORDS", label: "Falling Typing" },
     { value: "GALAXY", label: "Galaxy Game" },
     { value: "GRID", label: "Grid Game" },
     { value: "BOOKWORM", label: "Bookworm" },
     { value: "CROSSWORD", label: "Crossword" },
     { value: "FOUR_PICS", label: "Four Pics" },
     { value: "CODE_CHALLENGES", label: "Code Challenges" },
     { value: "MAP", label: "Map Game" },
     { value: "SYNTAX_SAVER", label: "Syntax Saver" },
     { value: "CHALLENGES", label: "Challenges" },
   ];
   ```

### Alignment with Prior Phases
All decisions from Phase 1 (backend) and Phase 2 (frontend) apply:
- Combined score formula: WPM × (Accuracy/100) × 1.5 if accuracy > 95%
- Filter dropdown (not tabs)
- Public endpoints (no auth required)
- 10 entries per page, offset pagination
- Sequential ranks for ties

</decisions>

<deferred>
## Deferred Ideas

Phase 1b is complete. Remaining items deferred to future phases:
- Cursor pagination (Phase 8 - Polish)
- Real-time updates via WebSocket (future)
- Achievement badges (future)

</deferred>

---

*Phase: 1b-leaderboard-game-mode-expansion*
*Context gathered: 2026-03-25*
*Status: Complete - no implementation needed*
