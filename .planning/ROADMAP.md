# SyntaxType Roadmap

**Generated:** 2026-03-14  
**Updated:** 2026-03-25
**Granularity:** standard

---

## Phases

- [x] **Phase 1: Leaderboard Data Layer** - Create backend API and data models for best scores per game ✅
- [x] **Phase 2: Leaderboard Frontend** - Build leaderboard page to display top scores by game ✅
- [ ] **Phase 1b: Leaderboard Game Mode Expansion** - Add scoring for new game modes (FourPics, CodeChallenges, Map, SyntaxSaver)
- [ ] **Phase 3: Game Score Integration** - Connect game score submission to leaderboard system
- [ ] **Phase 4: Security & Error Handling** - Enable JWT auth, externalize secrets, configure exception handlers
- [ ] **Phase 5: Backend Quality & Testing** - Fix data layer issues, add security tests
- [ ] **Phase 6: Backend Modularization** - Restructure codebase into domain-based modules
- [ ] **Phase 7: Frontend Improvements** - Migrate to Vite, fix quality issues
- [ ] **Phase 8: Polish & Production Readiness** - Add logging, caching, integration tests

---

## Phase Details

### Phase 1: Leaderboard Data Layer ✅

**Goal:** Create backend infrastructure to track and retrieve best scores for each player across all games

**Status:** Complete

**Requirements:** LB-01, LB-02, LB-03, LB-04

**Deliverables:**
- LeaderboardEntry DTO with combined score formula
- LeaderboardRepository with ranking queries
- LeaderboardService with aggregation logic
- LeaderboardController with 3 public endpoints
- Database indexes for performance

---

### Phase 2: Leaderboard Frontend ✅

**Goal:** Build user-facing leaderboard page showing best scores per game with filtering and sorting

**Status:** Complete

**Requirements:** LB-05, LB-06, LB-07

**Deliverables:**
- LeaderboardPage.js component (~370 lines)
- Table with medal emojis for top 3
- Filter by game, sort by metric
- Best/Recent toggle with localStorage
- Current user highlighting
- Loading spinner, empty state, error auto-retry
- Guest banner with Register/Login

---

### Phase 1b: Leaderboard Game Mode Expansion

**Goal:** Integrate new game modes into the leaderboard system with proper scoring

**Depends on:** Phase 2

**Requirements:** LB-08, LB-09, LB-10, LB-11, LB-12

**Success Criteria** (what must be TRUE):

1. Category enum includes all game types: TYPING_TESTS, FALLING_WORDS, GALAXY, GRID, BOOKWORM, CROSSWORD, FOUR_PICS, CODE_CHALLENGES, MAP, SYNTAX_SAVER, CHALLENGES, OVERALL
2. LeaderboardPage.js game filter dropdown shows all 10 game categories
3. LeaderboardController accepts all category values from frontend

**Plans:** TBD

---

### Phase 3: Game Score Integration (NEW)

**Goal:** Connect game score submission to leaderboard system so scores actually appear on leaderboards

**Depends on:** Phase 1b

**Requirements:** SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05

**Problem:** Games submit scores to `/api/scores` but Leaderboard table is never updated. Two separate systems exist but aren't connected.

**Success Criteria** (what must be TRUE):

1. When a user completes a game, their score is recorded in the Leaderboard table with the correct category
2. Each game type has a unified score submission endpoint that updates both Score and Leaderboard tables
3. Score submission includes: WPM, accuracy, category (game type)
4. Backend recalculates combined score and updates user's best if new score is higher
5. Leaderboard reflects scores immediately after game completion
6. All 10 game types (TypingTest, FallingTyping, Galaxy, Grid, Bookworm, Crossword, FourPics, CodeChallenges, Map, SyntaxSaver) submit to leaderboard

**Score Submission Mapping:**

| Game Type | Frontend File | Current Endpoint | Needs Update |
|-----------|---------------|------------------|--------------|
| TypingTest | TypingTest.js | POST /api/scores | Yes - add Leaderboard update |
| FallingTyping | FallingTypingTest.js | POST /api/scores/falling | Yes - add Leaderboard update |
| Galaxy | GalaxyGame.js | None | Yes - create endpoint |
| Grid | GridGame.js | None | Yes - create endpoint |
| Bookworm | Bookworm.js | None | Yes - create endpoint |
| Crossword | CrosswordGame.js | None | Yes - create endpoint |
| FourPics | FourPicsGame.js | None | Yes - create endpoint |
| CodeChallenges | codeChallenges.js | None | Yes - create endpoint |
| Map | map.js | None | Yes - create endpoint |
| SyntaxSaver | SyntaxSaverLesson.js | None | Yes - create endpoint |

**Plans:** TBD

---

### Phase 4: Security & Error Handling

**Goal:** Users can securely access the application with JWT authentication, and API errors return proper responses

**Depends on:** Phase 3

**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, ERR-01, ERR-02, ERR-03, ERR-04, ERR-05

**Success Criteria** (what must be TRUE):

1. Application fails to start if required environment variables (DB_PASSWORD, JWT_SECRET) are not set
2. User can register and receive a valid JWT token with 15-minute expiration
3. Authenticated requests with valid JWT token return expected data; requests without token receive 401
4. User with STUDENT role can access /api/games/* but cannot access /api/admin/*
5. User with ADMIN role can access all endpoints including /api/admin/*
6. API errors return JSON with "message", "error", and "status" fields (not raw exception stack traces)
7. Validation errors on POST /api/register return 400 with field-specific error details

**Plans:** TBD

---

### Phase 5: Backend Quality & Testing

**Goal:** Backend data layer is consistent and reliable; authentication is properly tested

**Depends on:** Phase 4

**Requirements:** BQ-01, BQ-02, BQ-03, BQ-04, BQ-05, TEST-01, TEST-02, TEST-03

**Success Criteria** (what must be TRUE):

1. pom.xml contains exactly one PostgreSQL dependency (no duplicates)
2. Calling UserStatisticsService.getStatisticsForUserAndLesson returns actual data, not empty DTO
3. All service methods throw appropriate exceptions (NotFoundException, IllegalArgumentException) instead of returning null
4. Application startup logs show INFO level; DEBUG logs do not appear in production profile
5. CORS configuration reads allowed origins from environment variable, not hardcoded values
6. Unit test verifies JWT token generation and validation with correct claims
7. Integration test verifies STUDENT role cannot access admin endpoints
8. Frontend auth flow test verifies token storage and Authorization header inclusion

**Plans:** TBD

---

### Phase 6: Backend Modularization

**Goal:** Codebase organized by domain for improved maintainability and clear boundaries

**Depends on:** Phase 5

**Requirements:** (Code restructuring - no new functional requirements)

**Success Criteria** (what must be TRUE):

1. Source code reorganized into domain modules: user/, lesson/, game/, statistics/
2. Each module contains its own Controller, Service, Repository, and DTO packages
3. No cross-module imports between domain packages (all communication via APIs)
4. Application compiles and all existing tests pass after restructuring
5. Package-private boundaries enforced (modules expose only necessary public APIs)

**Plans:** TBD

---

### Phase 7: Frontend Improvements

**Goal:** Modern build system with improved code quality and user experience

**Depends on:** Phase 6

**Requirements:** FQ-01, FQ-02, FQ-03, FQ-04

**Success Criteria** (what must be TRUE):

1. Application builds using Vite instead of deprecated react-scripts
2. npm install completes without warnings about incorrect package types
3. Score display shows actual numeric values (not blank/empty) after completing a game
4. Network error (API failure) displays user-friendly error message in UI instead of silent failure or raw error

**Plans:** TBD

---

### Phase 8: Polish & Production Readiness

**Goal:** Production-ready application with observability and comprehensive test coverage

**Depends on:** Phase 7

**Requirements:** (Final hardening - no new functional requirements)

**Success Criteria** (what must be TRUE):

1. Request/response logging captures endpoint, method, status code, and duration
2. Caching implemented for leaderboard data (reduces DB load)
3. Integration tests cover critical user paths: registration → login → play game → view score
4. Health check endpoint (/actuator/health) returns UP when application is running

**Plans:** TBD

---

## Coverage Map

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 1 - Leaderboard Data Layer | Backend API for best scores | LB-01 to LB-04 | ✅ Complete |
| 2 - Leaderboard Frontend | User-facing leaderboard UI | LB-05 to LB-07 | ✅ Complete |
| 1b - Game Mode Expansion | Integrate new game modes | LB-08 to LB-12 | Pending |
| 3 - Game Score Integration | Connect games to leaderboard | SCORE-01 to SCORE-05 | Pending |
| 4 - Security & Error Handling | Secure JWT auth | SEC-01 to SEC-06, ERR-01 to ERR-05 | Pending |
| 5 - Backend Quality & Testing | Consistent data layer | BQ-01 to BQ-05, TEST-01 to TEST-03 | Pending |
| 6 - Backend Modularization | Domain-based organization | (restructuring) | Pending |
| 7 - Frontend Improvements | Modern build | FQ-01 to FQ-04 | Pending |
| 8 - Polish & Production Readiness | Production hardening | (observability) | Pending |

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Leaderboard Data Layer | ✅ Complete | 2026-03-23 |
| 2. Leaderboard Frontend | ✅ Complete | 2026-03-23 |
| 1b. Game Mode Expansion | Not started | - |
| 3. Game Score Integration | Not started | - |
| 4. Security & Error Handling | Not started | - |
| 5. Backend Quality & Testing | Not started | - |
| 6. Backend Modularization | Not started | - |
| 7. Frontend Improvements | Not started | - |
| 8. Polish & Production Readiness | Not started | - |

---

## Game Categories Reference

| Category Enum | Frontend Page | Phase 1 Support | Score Integration |
|--------------|---------------|-----------------|------------------|
| TYPING_TESTS | TypingTest.js | ✅ | ❌ Phase 3 |
| FALLING_WORDS | FallingTypingTest.js | ✅ | ❌ Phase 3 |
| GALAXY | GalaxyGame/ | ✅ | ❌ Phase 3 |
| GRID | GridGame.js | ✅ | ❌ Phase 3 |
| BOOKWORM | Bookworm.js | ✅ | ❌ Phase 3 |
| CROSSWORD | CrosswordGame.js | ✅ | ❌ Phase 3 |
| FOUR_PICS | FourPicsGame.js | ❌ Phase 1b | ❌ Phase 3 |
| CODE_CHALLENGES | codeChallenges.js | ❌ Phase 1b | ❌ Phase 3 |
| MAP | map.js | ❌ Phase 1b | ❌ Phase 3 |
| SYNTAX_SAVER | SyntaxSaverLesson.js | ❌ Phase 1b | ❌ Phase 3 |
| CHALLENGES | ChallengePage.js | ❌ Phase 1b | ❌ Phase 3 |
| OVERALL | (computed) | ✅ | ✅ Phase 3 |

---

*Generated by GSD workflow - updated with score integration phase*
