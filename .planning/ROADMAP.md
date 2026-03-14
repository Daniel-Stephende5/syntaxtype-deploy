# SyntaxType Roadmap

**Generated:** 2026-03-14  
**Granularity:** standard

---

## Phases

- [ ] **Phase 1: Security & Error Handling** - Enable JWT auth, externalize secrets, configure exception handlers
- [ ] **Phase 2: Backend Quality & Testing** - Fix data layer issues, add security tests
- [ ] **Phase 3: Backend Modularization** - Restructure codebase into domain-based modules
- [ ] **Phase 4: Frontend Improvements** - Migrate to Vite, fix quality issues
- [ ] **Phase 5: Polish & Production Readiness** - Add logging, caching, integration tests

---

## Phase Details

### Phase 1: Security & Error Handling

**Goal:** Users can securely access the application with JWT authentication, and API errors return proper responses

**Depends on:** Nothing (first phase)

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

### Phase 2: Backend Quality & Testing

**Goal:** Backend data layer is consistent and reliable; authentication is properly tested

**Depends on:** Phase 1

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

### Phase 3: Backend Modularization

**Goal:** Codebase organized by domain for improved maintainability and clear boundaries

**Depends on:** Phase 2

**Requirements:** (Code restructuring - no new functional requirements)

**Success Criteria** (what must be TRUE):

1. Source code reorganized into domain modules: user/, lesson/, game/, statistics/
2. Each module contains its own Controller, Service, Repository, and DTO packages
3. No cross-module imports between domain packages (all communication via APIs)
4. Application compiles and all existing tests pass after restructuring
5. Package-private boundaries enforced (modules expose only necessary public APIs)

**Plans:** TBD

---

### Phase 4: Frontend Improvements

**Goal:** Modern build system with improved code quality and user experience

**Depends on:** Phase 3

**Requirements:** FQ-01, FQ-02, FQ-03, FQ-04

**Success Criteria** (what must be TRUE):

1. Application builds using Vite instead of deprecated react-scripts
2. npm install completes without warnings about incorrect package types
3. Score display shows actual numeric values (not blank/empty) after completing a game
4. Network error (API failure) displays user-friendly error message in UI instead of silent failure or raw error

**Plans:** TBD

---

### Phase 5: Polish & Production Readiness

**Goal:** Production-ready application with observability and comprehensive test coverage

**Depends on:** Phase 4

**Requirements:** (Final hardening - no new functional requirements)

**Success Criteria** (what must be TRUE):

1. Request/response logging captures endpoint, method, status code, and duration
2. Caching implemented for leaderboard data (reduces DB load)
3. Integration tests cover critical user paths: registration → login → play game → view score
4. Health check endpoint (/actuator/health) returns UP when application is running

**Plans:** TBD

---

## Coverage Map

| Phase | Goal | Requirements | Success Criteria |
|-------|------|--------------|------------------|
| 1 - Security & Error Handling | Secure JWT auth with proper errors | SEC-01 to SEC-06, ERR-01 to ERR-05 | 7 criteria |
| 2 - Backend Quality & Testing | Consistent data layer, tested auth | BQ-01 to BQ-05, TEST-01 to TEST-03 | 8 criteria |
| 3 - Backend Modularization | Domain-based code organization | (restructuring) | 5 criteria |
| 4 - Frontend Improvements | Modern build, quality fixes | FQ-01 to FQ-04 | 4 criteria |
| 5 - Polish & Production Readiness | Production hardening | (observability) | 4 criteria |

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security & Error Handling | 0/1 | Not started | - |
| 2. Backend Quality & Testing | 0/1 | Not started | - |
| 3. Backend Modularization | 0/1 | Not started | - |
| 4. Frontend Improvements | 0/1 | Not started | - |
| 5. Polish & Production Readiness | 0/1 | Not started | - |

---

*Generated by GSD workflow - auto mode*
