# Phase 3: Game Score Integration - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect game score submission to leaderboard system so scores actually appear on leaderboards. This includes 8 games:
- TypingTest.js, FallingTypingTest.js (update existing submission)
- GalaxyMainGame.js, GridGame.js, Bookworm.js, CrosswordGame.js, SyntaxSaverLesson.js (create submission)
- FourPicsGame.js (implement score tracking + submission)

</domain>

<decisions>
## Implementation Decisions

### Backend API Approach
- **Single unified endpoint:** `POST /api/scores/{category}`
  - Extends existing ScoreController (minimal changes to structure)
  - Game type passed as path variable
- **User identification:** Extract from JWT token (more secure, frontend doesn't pass userId)
- **Data persistence:** Always save to Score table (for analytics) AND update Leaderboard if better

### Score Types for Non-Typing Games
- **Two leaderboard types:**
  - **Typing games:** TYPING_TESTS, FALLING_WORDS - rank by WPM/accuracy/combined score
  - **Non-typing games:** GALAXY, GRID, BOOKWORM, CROSSWORD, FOUR_PICS, SYNTAX_SAVER - rank by raw score
- **Separate OVERALL categories:**
  - OVERALL_TYPING (best from TYPING_TESTS, FALLING_WORDS)
  - OVERALL_GAMES (best from GALAXY, GRID, BOOKWORM, CROSSWORD, FOUR_PICS, SYNTAX_SAVER)
- **Non-typing games:** Use raw score directly (not calculated WPM)

### Leaderboard Update Logic
- **Update only if better:** Only update Leaderboard when new score beats previous best
- **Keep full history:** All attempts saved to Score table for analytics
- **Compare before save:** Service layer checks if new score > existing best before DB write
- **Category-specific metrics:**
  - Typing: compare combined score (WPM × accuracy/100 × 1.5 if accuracy > 95%)
  - Non-typing: compare raw score

### Frontend Submission Timing
- **Manual submit button:** User clicks to submit after seeing results
- **Block with loading state:** Show spinner while submitting
- **Check auth at submission:** Allow play without login, check JWT at submission time
- **Allow retry:** Can resubmit from results screen if first attempt failed

</decisions>

<specifics>
## Specific Implementation Details

### Endpoint: POST /api/scores/{category}
Request body:
```json
{
  "wpm": 65,          // For typing games, 0 for others
  "accuracy": 95,     // For typing games, 100 for others  
  "score": 1000,      // Raw game score
  "timeSpent": 120    // Optional: time in seconds
}
```

Response:
```json
{
  "success": true,
  "isNewBest": true,
  "rank": 5
}
```

### Category Mapping
| Game | Category | Score Type |
|------|----------|-----------|
| TypingTest.js | TYPING_TESTS | WPM + accuracy |
| FallingTypingTest.js | FALLING_WORDS | WPM + accuracy |
| GalaxyMainGame.js | GALAXY | Raw score |
| GridGame.js | GRID | Raw score |
| Bookworm.js | BOOKWORM | Raw score |
| CrosswordGame.js | CROSSWORD | Raw score |
| FourPicsGame.js | FOUR_PICS | Raw score |
| SyntaxSaverLesson.js | SYNTAX_SAVER | Raw score |

### New Category Enum Values
Add to Category.java:
```java
OVERALL_TYPING,  // Best from typing games
OVERALL_GAMES     // Best from non-typing games
```

</specifics>

<deferred>
## Deferred Ideas

- Real-time leaderboard updates via WebSocket (future phase)
- Achievement badges for leaderboard milestones (future phase)
- Friend-specific leaderboards (future phase)

</deferred>

---

*Phase: 03-game-score-integration*
*Context gathered: 2026-03-25*
