# Requirements - SyntaxType Improvements

**Generated:** 2026-03-14
**Updated:** 2026-03-25

## v1 Requirements

### Leaderboards

#### Phase 1-2: Core Leaderboard (Complete)
- [x] **LB-01**: Create backend LeaderboardController with endpoints for global, game-specific, and user-specific leaderboards
- [x] **LB-02**: Create LeaderboardService to aggregate scores from all game types
- [x] **LB-03**: Define LeaderboardEntry DTO with fields: rank, username, score, gameName, dateAchieved
- [x] **LB-04**: Optimize queries with database indexes for score-based sorting (top 10 per game)
- [x] **LB-05**: Create LeaderboardPage component with tabs/filters for different game types
- [x] **LB-06**: Display top 10 scores with rank, username, score, game, and date
- [x] **LB-07**: Highlight current user's row in leaderboard when logged in

#### Phase 1b: Leaderboard Game Mode Expansion
- [ ] **LB-08**: Update Category enum to include all game types (FOUR_PICS, CODE_CHALLENGES, MAP, SYNTAX_SAVER)
- [ ] **LB-09**: Update LeaderboardPage.js game filter dropdown to include all game modes
- [ ] **LB-10**: Update LeaderboardController to support all game categories
- [ ] **LB-11**: Update OVERALL calculation to include all game types

#### Phase 3: Game Score Integration (NEW)
- [ ] **SCORE-01**: Create unified score submission endpoint that updates both Score and Leaderboard tables
- [ ] **SCORE-02**: Update TypingTest.js to submit score with WPM and accuracy to leaderboard
- [ ] **SCORE-03**: Update FallingTypingTest.js and AdvancedFallingTypingTest.js to submit to leaderboard
- [ ] **SCORE-04**: Create score submission for new games: Galaxy, Grid, Bookworm, Crossword, FourPics, CodeChallenges, Map, SyntaxSaver
- [ ] **SCORE-05**: Backend updates Leaderboard record when new score exceeds previous best for user/category

### Security (CRITICAL - Must Fix)

- [ ] **SEC-01**: Externalize all hardcoded credentials in application.properties to environment variables
- [ ] **SEC-02**: Enable JWT authentication filter in SecurityConfig.java (currently commented out)
- [ ] **SEC-03**: Change API endpoints from `.permitAll()` to `.authenticated()` with role-based rules
- [ ] **SEC-04**: Configure strong JWT secret (256-bit minimum) via environment variable
- [ ] **SEC-05**: Add JWT token expiration (15-minute access token recommended)
- [ ] **SEC-06**: Update frontend to include Authorization header with JWT tokens

### Error Handling (HIGH PRIORITY)

- [ ] **ERR-01**: Enable GlobalExceptionHandler with proper error responses
- [ ] **ERR-02**: Enable RestExceptionHandler with consistent API error format
- [ ] **ERR-03**: Add validation error handling for DTOs (@Valid annotations)
- [ ] **ERR-04**: Configure appropriate HTTP status codes for different error types
- [ ] **ERR-05**: Prevent raw exception messages from leaking to clients

### Backend Quality

- [ ] **BQ-01**: Remove duplicate PostgreSQL dependency from pom.xml
- [ ] **BQ-02**: Implement stub method in UserStatisticsService (currently returns empty DTO with TODO)
- [ ] **BQ-03**: Fix 88+ methods that return null instead of throwing appropriate exceptions
- [ ] **BQ-04**: Disable DEBUG logging in production configuration
- [ ] **BQ-05**: Verify CORS configuration uses environment variables (not hardcoded)

### Frontend Quality

- [ ] **FQ-01**: Update deprecated react-scripts to Vite or modern CRA alternative
- [ ] **FQ-02**: Fix incorrect NPM packages in production dependencies
- [ ] **FQ-03**: Complete incomplete score display feature (has TODO comment)
- [ ] **FQ-04**: Add proper error handling UI for API failures

### Testing (Initial Coverage)

- [ ] **TEST-01**: Add unit tests for JWT authentication flow
- [ ] **TEST-02**: Add integration tests for role-based access control
- [ ] **TEST-03**: Add frontend tests for authentication flow

---

## Game Score Status

| Game | Frontend File | Score Submission | Leaderboard |
|------|---------------|------------------|-------------|
| Typing Test | TypingTest.js | POST /api/scores | ❌ Not connected |
| Falling Typing | FallingTypingTest.js | POST /api/scores/falling | ❌ Not connected |
| Advanced Falling | AdvancedFallingTypingTest.js | POST /api/scores/falling | ❌ Not connected |
| Galaxy | GalaxyGame.js | None | ❌ No endpoint |
| Grid | GridGame.js | None | ❌ No endpoint |
| Bookworm | Bookworm.js | None | ❌ No endpoint |
| Crossword | CrosswordGame.js | None | ❌ No endpoint |
| Four Pics | FourPicsGame.js | None | ❌ No endpoint |
| Code Challenges | codeChallenges.js | None | ❌ No endpoint |
| Map Game | map.js | None | ❌ No endpoint |
| Syntax Saver | SyntaxSaverLesson.js | None | ❌ No endpoint |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LB-01 to LB-07 | Phase 1-2 | ✅ Complete |
| LB-08 to LB-11 | Phase 1b | Pending |
| SCORE-01 to SCORE-05 | Phase 3 | Pending |
| SEC-01 to SEC-06 | Phase 4 | Pending |
| ERR-01 to ERR-05 | Phase 4 | Pending |
| BQ-01 to BQ-05 | Phase 5 | Pending |
| TEST-01 to TEST-03 | Phase 5 | Pending |
| FQ-01 to FQ-04 | Phase 7 | Pending |

**Coverage:** 40/40 requirements mapped

---

*Generated by GSD workflow - updated with score integration phase*
