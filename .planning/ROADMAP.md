# SyntaxType Roadmap

**Generated:** 2026-03-14  
**Updated:** 2026-03-25
**Granularity:** standard

---

## Phases

- [x] **Phase 1: Leaderboard Data Layer** - Create backend API and data models for best scores per game ✅
- [x] **Phase 2: Leaderboard Frontend** - Build leaderboard page to display top scores by game ✅
- [ ] **Phase 1b: Leaderboard Game Mode Expansion** - Add category support for new game modes
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

**Deliverables:**
- LeaderboardPage.js component
- Table with medal emojis for top 3
- Filter by game, sort by metric
- Best/Recent toggle with localStorage
- Current user highlighting
- Loading spinner, empty state, error auto-retry
- Guest banner with Register/Login

---

### Phase 1b: Leaderboard Game Mode Expansion

**Goal:** Update category enum and frontend to support all game types

**Depends on:** Phase 2

**Requirements:** LB-08, LB-09, LB-10, LB-11

**Success Criteria:**
1. Category enum includes: TYPING_TESTS, FALLING_WORDS, GALAXY, GRID, BOOKWORM, CROSSWORD, FOUR_PICS, CODE_CHALLENGES, MAP, SYNTAX_SAVER, CHALLENGES, OVERALL
2. LeaderboardPage.js game filter dropdown shows all categories
3. LeaderboardController accepts all category values

**Plans:** TBD

---

### Phase 3: Game Score Integration

**Goal:** Connect game score submission to leaderboard system so scores actually appear on leaderboards

**Depends on:** Phase 1b

**Requirements:** SCORE-01 to SCORE-09

**Problem:** Games track scores locally but don't submit to Leaderboard table.

**Games Requiring Score Integration:**

| # | Game | Frontend File | Current Status | Action Needed |
|---|------|---------------|---------------|---------------|
| 1 | Typing Test | TypingTest.js | Submits to `/api/scores` | Add Leaderboard update |
| 2 | Falling Typing | FallingTypingTest.js | Submits to `/api/scores/falling` | Add Leaderboard update |
| 3 | Galaxy Game | GalaxyMainGame.js | Has local score | Create submission endpoint |
| 4 | Grid Game | GridGame.js | Has local score | Create submission endpoint |
| 5 | Bookworm | Bookworm.js | Has local score | Create submission endpoint |
| 6 | Crossword | CrosswordGame.js | Has local score | Create submission endpoint |
| 7 | Four Pics | FourPicsGame.js | No score tracking | Implement score + submission |
| 8 | Syntax Saver | SyntaxSaverLesson.js | Has local score | Create submission endpoint |

**Note:** AdvancedFallingTypingTest.js may be cancelled due to time constraints. Status: TBD

**Success Criteria:**
1. All 8 games submit scores to Leaderboard table with correct category
2. Score submission includes: WPM, accuracy, category (game type), user ID
3. Backend updates Leaderboard record when new score exceeds previous best
4. Leaderboard reflects scores immediately after game completion

**Plans:** TBD

---

### Phase 4: Security & Error Handling

**Goal:** Users can securely access the application with JWT authentication, and API errors return proper responses

**Depends on:** Phase 3

**Requirements:** SEC-01 to SEC-06, ERR-01 to ERR-05

**Success Criteria:**
1. Application fails to start if required environment variables not set
2. User can register and receive valid JWT token with 15-minute expiration
3. Authenticated requests work; unauthenticated receive 401
4. Role-based access control enforced
5. API errors return JSON with proper format
6. Validation errors return 400 with field details

**Plans:** TBD

---

### Phase 5: Backend Quality & Testing

**Goal:** Backend data layer is consistent and reliable; authentication is properly tested

**Depends on:** Phase 4

**Requirements:** BQ-01 to BQ-05, TEST-01 to TEST-03

**Success Criteria:**
1. No duplicate PostgreSQL dependencies
2. UserStatisticsService returns actual data
3. Service methods throw proper exceptions (not return null)
4. DEBUG logs disabled in production
5. CORS reads from environment variables
6. JWT unit tests pass
7. Role-based access integration tests pass

**Plans:** TBD

---

### Phase 6: Backend Modularization

**Goal:** Codebase organized by domain for improved maintainability

**Depends on:** Phase 5

**Requirements:** (Code restructuring)

**Success Criteria:**
1. Code organized into domain modules: user/, lesson/, game/, statistics/
2. Each module has own Controller, Service, Repository, DTO
3. No cross-module imports
4. Application compiles and tests pass after restructuring

**Plans:** TBD

---

### Phase 7: Frontend Improvements

**Goal:** Modern build system with improved code quality

**Depends on:** Phase 6

**Requirements:** FQ-01 to FQ-04

**Success Criteria:**
1. Application builds using Vite
2. npm install completes without warnings
3. Score display shows actual values after game
4. Network errors display user-friendly messages

**Plans:** TBD

---

### Phase 8: Polish & Production Readiness

**Goal:** Production-ready application with observability

**Depends on:** Phase 7

**Requirements:** (Final hardening)

**Success Criteria:**
1. Request/response logging captures endpoint, method, status, duration
2. Caching for leaderboard data
3. Integration tests cover critical paths
4. Health check endpoint returns UP

**Plans:** TBD

---

## Coverage Map

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 1 - Leaderboard Data Layer | Backend API | LB-01 to LB-04 | ✅ Complete |
| 2 - Leaderboard Frontend | UI | LB-05 to LB-07 | ✅ Complete |
| 1b - Game Mode Expansion | Categories | LB-08 to LB-11 | Pending |
| 3 - Game Score Integration | Connect games | SCORE-01 to SCORE-09 | Pending |
| 4 - Security & Error Handling | JWT auth | SEC-01 to SEC-06, ERR-01 to ERR-05 | Pending |
| 5 - Backend Quality & Testing | Quality | BQ-01 to BQ-05, TEST-01 to TEST-03 | Pending |
| 6 - Backend Modularization | Structure | (restructuring) | Pending |
| 7 - Frontend Improvements | Modernize | FQ-01 to FQ-04 | Pending |
| 8 - Polish & Production Readiness | Production | (observability) | Pending |

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

## Games Requiring Score Integration

| Game | File | Score Type | Leaderboard Category |
|------|------|-----------|---------------------|
| Typing Test | TypingTest.js | WPM + accuracy | TYPING_TESTS |
| Falling Typing | FallingTypingTest.js | WPM + accuracy | FALLING_WORDS |
| Galaxy Game | GalaxyMainGame.js | Points | GALAXY |
| Grid Game | GridGame.js | Points | GRID |
| Bookworm | Bookworm.js | Points | BOOKWORM |
| Crossword | CrosswordGame.js | Points | CROSSWORD |
| Four Pics | FourPicsGame.js | Points | FOUR_PICS |
| Syntax Saver | SyntaxSaverLesson.js | Points | SYNTAX_SAVER |

**Deferred/Cancelled:**
- AdvancedFallingTypingTest.js - May be cancelled
- CodeChallenges - Not prioritized
- Map Game - Not prioritized

---

*Generated by GSD workflow*
