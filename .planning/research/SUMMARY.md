# Project Research Summary

**Project:** SyntaxType - Educational Typing Platform
**Domain:** Brownfield Spring Boot + React Educational Technology
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

This is a brownfield educational typing platform (similar to Typing.com, TypeTastic) built with Spring Boot and React. The codebase has substantial existing functionality—6 game modes, lesson system, role-based access, scoring—but suffers from **critical security vulnerabilities**: JWT authentication is disabled, secrets are hardcoded, and exception handlers are commented out. Research indicates the optimal approach is a **phased remediation strategy** starting with security hardening, then architectural improvements.

The recommended path: (1) enable JWT authentication with proper secrets management, (2) fix error handling, (3) modularize the backend by domain, (4) migrate frontend to feature-based architecture, then (5) add polish features. Attempting to add gamification or multiplayer features before fixing security would be reckless—any user data exposure or token theft would be catastrophic.

Key risks: enabling auth breaks all existing API clients (frontend wasn't built for authenticated calls), hardcoded secrets often persist after "fixes" via fallback defaults, and deprecated Spring Security patterns in the codebase will fail on compilation. Mitigation requires strict environment variable validation, phased auth rollout, and comprehensive role-testing before production.

## Key Findings

### Recommended Stack

**Core technologies:**
- **jjwt 0.12.6** — JWT token generation/validation, already present and stable
- **Spring Security 3.4.4** (BOM) — Authentication framework via spring-boot-starter-security
- **BCrypt** — Password hashing, already configured
- **PostgreSQL** — Existing database, appropriate for domain
- **Environment Variables** — For secrets management (Render, Vault, or AWS Secrets Manager for production)

**Critical fixes needed:**
- Enable JWT filter in SecurityConfig (currently commented out)
- Move all hardcoded secrets (DB password, JWT secret, admin password) to environment variables with NO fallback defaults
- Replace deprecated `WebSecurityConfigurerAdapter` pattern with `SecurityFilterChain` bean
- Uncomment and update GlobalExceptionHandler before enabling auth

### Expected Features

**Must have (table stakes):**
- WPM tracking and accuracy measurement — already exists
- User registration/login with JWT — auth disabled, needs re-enabling
- Role-based access (Student/Teacher/Admin) — implemented but untested with real auth
- Progress persistence — PostgreSQL-backed, functional
- Basic leaderboard — implemented

**Should have (competitive differentiators):**
- Real-time multiplayer racing — TypeRacer/TypeWars style (HIGH complexity)
- Achievement badges and XP/leveling — Duolingo-style progression
- Daily challenges with streak tracking — major retention driver
- Problem key identification for adaptive practice
- Dark/light theme toggle — quick win

**Defer (v2+):**
- Mobile/tablet responsive (requires significant rework)
- AI-generated personalized passages (needs ML infrastructure)
- Real-time chat during games (performance/distraction concerns)
- Social feeds (not aligned with educational mission)

### Architecture Approach

**Current state:** Layered architecture (Controller/Service/Repository in flat folders), type-based frontend organization, disabled security, commented-out error handlers.

**Recommended:** Modular monolith with domain-based package structure. Backend evolves from `com.syntaxtype.demo/Controller|Service|Repository` to `com.syntaxtype.demo/module/{user,lesson,game,statistics}/{domain,application,infrastructure,api}`. Frontend migrates from type-based (`pages/`, `components/`, `utils/`) to feature-based (`features/auth/`, `features/lessons/`, `features/games/`).

**Major components:**
1. **user module** — Authentication, user management, roles, permissions
2. **lesson module** — Lesson CRUD, content management, quizzes
3. **game module** — Typing games, scoring, game state
4. **statistics module** — Progress tracking, leaderboards, analytics

### Critical Pitfalls

1. **Enabling auth breaks all existing API clients** — Frontend makes unauthenticated calls; enabling JWT without updating React to send Authorization headers causes complete failure. Fix: Update frontend token handling BEFORE enabling auth.

2. **Hardcoded secrets persist via fallback defaults** — Using `${JWT_SECRET:default}` leaves "default" in source. Fix: Use `${JWT_SECRET}` with no fallback, fail fast if not set.

3. **JWT tokens without expiration** — Tokens created without `exp` claim or long expiry remain valid forever if leaked. Fix: 15-minute access tokens with refresh token flow.

4. **Deprecated Spring Security configuration** — `WebSecurityConfigurerAdapter` was removed in Spring Boot 3. Fix: Use `@Bean SecurityFilterChain` pattern with `requestMatchers()`.

5. **Exception handlers remain disabled** — With auth enabled, unhandled exceptions leak stack traces. Fix: Uncomment GlobalExceptionHandler BEFORE enabling auth, add auth-specific exception handlers.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Security & Error Handling (CRITICAL)
**Rationale:** Security vulnerabilities are blockers—nothing else matters if user data is exposed or tokens are forged. This phase must complete before ANY feature work.

**Delivers:**
- Secrets externalized to environment variables (no fallback defaults)
- JWT authentication enabled and tested
- Role-based access control functional
- Global exception handlers enabled with auth-specific handlers
- Debug logging disabled in production

**Addresses:** All critical security features from STACK.md
**Avoids:** Pitfalls 1-7 from PITFALLS.md

**Research Flags:** Well-documented patterns—standard Spring Security 6.x approach. No additional research needed.

---

### Phase 2: Data Layer Improvements
**Rationale:** After security is stable, fix data quality issues that block meaningful feature work. Stub methods and null-return patterns prevent proper error handling.

**Delivers:**
- Remove duplicate PostgreSQL dependency (version conflicts)
- Implement stubbed `getStatisticsForUserAndLesson` method
- Standardize Optional vs null patterns across services

**Uses:** Existing PostgreSQL, JPA/Hibernate
**Implements:** Data consistency patterns

**Research Flags:** Low risk, isolated changes. No additional research needed.

---

### Phase 3: Backend Modularization
**Rationale:** Domain-based module structure improves maintainability and enables team scaling. Critical now that security is fixed and codebase will grow.

**Delivers:**
- Module folder structure (`module/user/`, `module/lesson/`, `module/game/`, `module/statistics/`)
- Code moved to domain-based packages
- Clear component boundaries with public APIs

**Uses:** Spring Modulith principles, existing Spring Boot
**Implements:** ARCHITECTURE.md domain module pattern

**Research Flags:** Standard modular monolith patterns. No additional research needed.

---

### Phase 4: Frontend Improvements
**Rationale:** Frontend needs feature-based organization to scale. Also need to fix deprecated build system.

**Delivers:**
- Migrate from react-scripts to Vite
- Feature-based folder structure (`features/auth/`, `features/lessons/`, `features/games/`)
- Dark/light theme toggle
- Sound effects toggle
- Keyboard shortcuts

**Implements:** FEATURES.md quick wins

**Research Flags:** Standard React architecture patterns. No additional research needed.

---

### Phase 5: Polish & Production Readiness
**Rationale:** Final production hardening before scaling user base.

**Delivers:**
- Request/response logging for observability
- Caching strategy implementation
- Integration tests for critical paths

**Research Flags:** Standard production practices. No additional research needed.

---

### Phase Ordering Rationale

- **Security first:** No feature work matters if the app is insecure. The research explicitly warns against adding features before fixing auth.
- **Data before architecture:** Need working data layer before modularizing—can't create clean boundaries with broken data access.
- **Frontend after backend auth:** Frontend needs authenticated API to work properly—doing this after backend security is stable ensures proper integration.
- **Polish last:** Production hardening makes sense only after core functionality is complete.

This ordering directly addresses Pitfall #1 (auth breaks clients) by ensuring Phase 4 frontend updates happen AFTER Phase 1 security is stable.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase beyond 5 (Multiplayer/Gamification):** Real-time multiplayer requires WebSocket infrastructure, matchmaking logic—complex integration that needs dedicated research
- **Adaptive Learning:** Problem key identification and difficulty adjustment require domain expertise research

Phases with standard patterns (skip research-phase):
- **Phase 1-5:** All use well-documented, established patterns from Spring Security, React best practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | jjwt 0.12.6 verified via GitHub releases, Spring Security 6.x documented |
| Features | HIGH | Market analysis from multiple typing platform sources, existing codebase verified |
| Architecture | HIGH | Spring Modulith official from Spring.io, feature-based React widely documented |
| Pitfalls | HIGH | Specific code patterns identified in codebase, prevention strategies verified |

**Overall confidence:** HIGH

### Gaps to Address

- **Existing stub methods:** `getStatisticsForUserAndLesson` returns empty DTO—needs implementation but scope is clear
- **Refresh token flow:** Not in current codebase, recommended for production but can defer to later phase
- **Multiplayer infrastructure:** Not covered in research—will need WebSocket/real-time research when that phase approaches
- **Detailed role permissions:** @PreAuthorize annotations exist but exact endpoint-to-role mapping needs verification during Phase 1

## Sources

### Primary (HIGH confidence)
- Spring Modulith Introduction (Spring.io, 2022) — Official modular monolith guidance
- JJWT GitHub Releases — Version 0.12.6/0.13.0 release notes
- Spring Security 6.x Documentation — SecurityFilterChain pattern

### Secondary (MEDIUM confidence)
- Spring Boot Security Best Practices (Katyella, 2026) — 2024/2025 guidance
- Modular Monolith Structure in Spring Boot (Medium, 2026) — Implementation patterns
- Feature-Based Architecture (Medium, 2026) — Frontend organization

### Tertiary (LOW confidence)
- HashiCorp Vault + Spring Boot — Enterprise secrets, defer until needed
- Adaptive learning research — Need deeper domain research before implementation

---

*Research completed: 2026-03-14*
*Ready for roadmap: yes*
