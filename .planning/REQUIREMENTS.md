# Requirements - SyntaxType Improvements

**Generated:** 2026-03-14
**Updated:** 2026-03-25

## v1 Requirements

### Leaderboards (Complete)

#### Phase 1-2: Core Leaderboard
- [x] **LB-01**: Create backend LeaderboardController with endpoints for global, game-specific, and user-specific leaderboards
- [x] **LB-02**: Create LeaderboardService to aggregate scores from all game types
- [x] **LB-03**: Define LeaderboardEntry DTO with fields: rank, username, score, gameName, dateAchieved
- [x] **LB-04**: Optimize queries with database indexes for score-based sorting (top 10 per game)
- [x] **LB-05**: Create LeaderboardPage component with tabs/filters for different game types
- [x] **LB-06**: Display top 10 scores with rank, username, score, game, and date
- [x] **LB-07**: Highlight current user's row in leaderboard when logged in

#### Phase 1b: Game Mode Expansion
- [ ] **LB-08**: Update Category enum to include all game types (FOUR_PICS, CODE_CHALLENGES, MAP, SYNTAX_SAVER)
- [ ] **LB-09**: Update LeaderboardPage.js game filter dropdown to include all game modes
- [ ] **LB-10**: Update LeaderboardController to support all game categories
- [ ] **LB-11**: Update OVERALL calculation to include all game types

### Phase 3: Game Score Integration (NEW)

| # | Requirement | Game | Description |
|---|-------------|------|-------------|
| [ ] **SCORE-01** | TypingTest.js | Update score submission to also update Leaderboard table |
| [ ] **SCORE-02** | FallingTypingTest.js | Update score submission to also update Leaderboard table |
| [ ] **SCORE-03** | GalaxyMainGame.js | Create score submission endpoint and connect to leaderboard |
| [ ] **SCORE-04** | GridGame.js | Create score submission endpoint and connect to leaderboard |
| [ ] **SCORE-05** | Bookworm.js | Create score submission endpoint and connect to leaderboard |
| [ ] **SCORE-06** | CrosswordGame.js | Create score submission endpoint and connect to leaderboard |
| [ ] **SCORE-07** | FourPicsGame.js | Implement score tracking + submission endpoint |
| [ ] **SCORE-08** | SyntaxSaverLesson.js | Create score submission endpoint and connect to leaderboard |
| [ ] **SCORE-09** | Backend Service | Update Leaderboard record when new score exceeds previous best |

**Backend Requirements:**
- Create unified score submission endpoint that updates both Score and Leaderboard tables
- Accept: userId, category, wpm, accuracy, score
- Return: success/failure
- Auto-calculate combined score using formula: WPM × (Accuracy/100) × 1.5 if accuracy > 95%

### Security (Phase 4)

- [ ] **SEC-01**: Externalize all hardcoded credentials in application.properties to environment variables
- [ ] **SEC-02**: Enable JWT authentication filter in SecurityConfig.java (currently commented out)
- [ ] **SEC-03**: Change API endpoints from `.permitAll()` to `.authenticated()` with role-based rules
- [ ] **SEC-04**: Configure strong JWT secret (256-bit minimum) via environment variable
- [ ] **SEC-05**: Add JWT token expiration (15-minute access token recommended)
- [ ] **SEC-06**: Update frontend to include Authorization header with JWT tokens

### Error Handling (Phase 4)

- [ ] **ERR-01**: Enable GlobalExceptionHandler with proper error responses
- [ ] **ERR-02**: Enable RestExceptionHandler with consistent API error format
- [ ] **ERR-03**: Add validation error handling for DTOs (@Valid annotations)
- [ ] **ERR-04**: Configure appropriate HTTP status codes for different error types
- [ ] **ERR-05**: Prevent raw exception messages from leaking to clients

### Backend Quality (Phase 5)

- [ ] **BQ-01**: Remove duplicate PostgreSQL dependency from pom.xml
- [ ] **BQ-02**: Implement stub method in UserStatisticsService (currently returns empty DTO with TODO)
- [ ] **BQ-03**: Fix 88+ methods that return null instead of throwing appropriate exceptions
- [ ] **BQ-04**: Disable DEBUG logging in production configuration
- [ ] **BQ-05**: Verify CORS configuration uses environment variables (not hardcoded)

### Testing (Phase 5)

- [ ] **TEST-01**: Add unit tests for JWT authentication flow
- [ ] **TEST-02**: Add integration tests for role-based access control
- [ ] **TEST-03**: Add frontend tests for authentication flow

### Frontend Quality (Phase 7)

- [ ] **FQ-01**: Update deprecated react-scripts to Vite or modern CRA alternative
- [ ] **FQ-02**: Fix incorrect NPM packages in production dependencies
- [ ] **FQ-03**: Complete incomplete score display feature (has TODO comment)
- [ ] **FQ-04**: Add proper error handling UI for API failures

---

## Game Score Integration Status

| Game | File | Current Score | Needs | Status |
|------|------|-------------|-------|--------|
| Typing Test | TypingTest.js | ✅ Submits | Leaderboard update | SCORE-01 |
| Falling Typing | FallingTypingTest.js | ✅ Submits | Leaderboard update | SCORE-02 |
| Galaxy Game | GalaxyMainGame.js | ✅ Local | Submission endpoint | SCORE-03 |
| Grid Game | GridGame.js | ✅ Local | Submission endpoint | SCORE-04 |
| Bookworm | Bookworm.js | ✅ Local | Submission endpoint | SCORE-05 |
| Crossword | CrosswordGame.js | ✅ Local | Submission endpoint | SCORE-06 |
| Four Pics | FourPicsGame.js | ❌ None | Full implementation | SCORE-07 |
| Syntax Saver | SyntaxSaverLesson.js | ✅ Local | Submission endpoint | SCORE-08 |

**Cancelled/Deferred:**
- AdvancedFallingTypingTest.js - May be cancelled (time constraints)
- CodeChallenges - Not prioritized
- Map Game - Not prioritized

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LB-01 to LB-07 | Phase 1-2 | ✅ Complete |
| LB-08 to LB-11 | Phase 1b | Pending |
| SCORE-01 to SCORE-09 | Phase 3 | Pending |
| SEC-01 to SEC-06 | Phase 4 | Pending |
| ERR-01 to ERR-05 | Phase 4 | Pending |
| BQ-01 to BQ-05 | Phase 5 | Pending |
| TEST-01 to TEST-03 | Phase 5 | Pending |
| FQ-01 to FQ-04 | Phase 7 | Pending |

**Total:** 44 requirements across 9 phases

---

*Generated by GSD workflow - updated with confirmed game list*
