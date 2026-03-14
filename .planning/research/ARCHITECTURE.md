# Architecture Research: Spring Boot + React Educational Platform

**Domain:** Educational Typing Platform (Brownfield)
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

This brownfield Spring Boot + React application currently uses a traditional layered architecture (Controller/Service/Repository) that has several critical issues: disabled security, hardcoded credentials, missing error handling, and null-return patterns. Research indicates the optimal approach for this project is a **phased modularization strategy** — fixing critical issues first, then gradually evolving toward a modular monolith architecture.

**Recommended pattern:** Stay with monolithic Spring Boot (no microservices) but introduce domain-based module boundaries using Spring Modulith principles. For React, migrate from type-based to feature-based architecture.

## Current Architecture Assessment

### What Exists

| Component | Current State | Assessment |
|-----------|---------------|------------|
| Backend | Layered (Controller/Service/Repository) | Functional but has security/error handling gaps |
| Frontend | Type-based (pages/components/utils) | Works but doesn't scale well |
| Database | PostgreSQL with JPA/Hibernate | Appropriate for domain |
| Auth | JWT (disabled) | Must be re-enabled |
| Error Handling | Exception handlers commented out | Critical gap |

### Critical Gaps Identified

1. **Security disabled**: All endpoints are `permitAll()`, JWT filter commented out
2. **Hardcoded credentials**: Database, JWT secret, admin credentials in source
3. **No error handling**: Services return `null` instead of throwing exceptions
4. **Stub methods**: `getStatisticsForUserAndLesson` returns empty DTO
5. **Debug logging in production**: Verbose logging enabled

## Recommended Architecture

### Overall Pattern: Modular Monolith

For an educational platform of this scope, microservices add unnecessary complexity. The recommended approach is a **modular monolith** that:

- Maintains single deployment unit simplicity
- Introduces clear domain boundaries
- Enables future extraction to microservices if needed

> **Source:** [Spring Modulith - Introduction (Spring.io, 2026)](https://spring.io/blog/2022/10/21/introducing-spring-modulith) — "Modular monoliths help maintain a level of independence while keeping the door open for microservices."

### Backend Architecture

#### Current (Layered - Problematic)

```
com.syntaxtype.demo/
├── Controller/     # All controllers in one folder
├── Service/        # All services in one folder
├── Repository/     # All repositories in one folder
├── Entity/         # All entities in one folder
└── ...
```

#### Recommended (Domain-Based Modules)

```
com.syntaxtype.demo/
├── module/
│   ├── user/           # User management domain
│   │   ├── domain/     # User entity, business rules
│   │   ├── application/# UserService, use cases
│   │   ├── infrastructure/# UserRepository adapter
│   │   └── api/        # UserController
│   ├── lesson/         # Lesson management domain
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── api/
│   ├── game/           # Typing games domain
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── api/
│   └── statistics/     # Progress tracking domain
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── api/
└── shared/            # Common utilities
    ├── security/       # JWT, authentication
    ├── config/         # Configuration
    └── exception/      # Global error handling
```

> **Source:** [Modular Monolith Structure in Spring Boot Backends (Medium, 2026)](https://medium.com/@AlexanderObregon/modular-monolith-structure-in-spring-boot-backends-24c10c9b8b07) — "With a modular monolith, the group keeps a single deployable Spring Boot application while the codebase is split into modules with strict boundaries."

### Frontend Architecture

#### Current (Type-Based - Scales Poorly)

```
frontend/src/
├── pages/         # All page components
├── components/    # All reusable components
├── utils/         # All utilities
└── css/           # All styles
```

#### Recommended (Feature-Based)

```
frontend/src/
├── features/           # Business features
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.ts
│   ├── lessons/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.ts
│   ├── games/
│   │   ├── typing-test/
│   │   ├── falling-words/
│   │   ├── galaxy/
│   │   └── ...
│   └── dashboard/
├── shared/            # Shared code
│   ├── ui/           # Button, Input, Card, Modal
│   ├── hooks/        # useAuth, useApi
│   ├── utils/        # formatters, validators
│   └── config/       # API config
├── pages/            # Route compositions
└── app/              # App config, providers
```

> **Source:** [Feature-Based Architecture (Medium, 2026)](https://medium.com/@udarasenarath/frontend-architecture-patterns-a-practical-guide-to-structuring-react-applications-that-scale-9af2701a6f0f) — "Feature-based architecture organizes code around business functionality instead of technical type."

## Component Boundaries

### Backend Modules

| Module | Responsibility | Public API | Dependencies |
|--------|---------------|------------|--------------|
| **user** | Authentication, user management, roles | `/api/auth/*`, `/api/users/*` | shared (security) |
| **lesson** | Lesson CRUD, content management | `/api/lessons/*` | user (permissions) |
| **game** | Typing games, scoring | `/api/games/*`, `/api/scores/*` | user, statistics |
| **statistics** | Progress tracking, leaderboards | `/api/statistics/*` | user |

### Frontend Features

| Feature | Components | State | API Calls |
|---------|------------|-------|-----------|
| **auth** | LoginForm, RegisterForm, ProtectedRoute | Token in context | auth API |
| **lessons** | LessonList, LessonEditor, Quiz | Local + server | lessons API |
| **games** | TypingTest, GalaxyGame, etc. | Game state | scores API |
| **dashboard** | StatsCard, Leaderboard, Progress | Server state | statistics API |

## Data Flow

### Authentication Flow

```
1. User submits credentials
   → LoginPage.js calls authService.login()
   → Axios POST /api/auth/login
   
2. Backend processes
   → AuthController.loginUser()
   → UserService validates credentials
   → JwtUtil.generateToken()
   
3. Token received
   → AuthUtils.setAuthToken() stores in localStorage
   → AuthContext updates state
   → ProtectedRoute allows access
```

### Game Session Flow

```
1. User starts game
   → GamePage.js loads game component
   → Game state initialized locally
   
2. During gameplay
   → User input → local state validation
   → Timer/score updates → local state
   → Periodically → POST /api/scores (auto-save)
   
3. Game ends
   → Final score → POST /api/scores
   → Statistics updated → POST /api/statistics
   → Leaderboard refreshed → GET /api/statistics/leaderboard
```

### Lesson Flow

```
1. Teacher creates lesson
   → CreateLessonPage → POST /api/lessons (TEACHER role)
   
2. Student accesses lesson
   → LessonList → GET /api/lessons
   → LessonDetail → GET /api/lessons/{id}
   
3. Student takes quiz
   → QuizPage → POST /api/lessons/{id}/quiz
   → Score calculated → POST /api/statistics
```

## Build Order Recommendations

Given this is a brownfield project with critical security issues, the following build order minimizes risk while building toward the target architecture:

### Phase 1: Security & Error Handling (Critical)

**Goal:** Fix the most critical issues before adding new features

| Order | Task | Module | Rationale |
|-------|------|--------|-----------|
| 1.1 | Move secrets to environment variables | shared/config | Prerequisite for enabling auth |
| 1.2 | Enable JWT authentication | shared/security | Must work before anything else |
| 1.3 | Configure role-based access | shared/security | Protect all endpoints |
| 1.4 | Enable exception handlers | shared/exception | Consistent error responses |
| 1.5 | Replace null returns with exceptions | all modules | Enables proper error handling |

**Dependencies:** No external dependencies
**Risk:** Medium — affects all existing functionality

### Phase 2: Data Layer Improvements

**Goal:** Fix data quality issues and stub methods

| Order | Task | Module | Rationale |
|-------|------|--------|-----------|
| 2.1 | Remove duplicate PostgreSQL dependency | build | Fix version conflicts |
| 2.2 | Implement getStatisticsForUserAndLesson | statistics | Complete stub method |
| 2.3 | Standardize Optional vs null patterns | user | Consistency |

**Dependencies:** Phase 1 complete (requires proper error handling)
**Risk:** Low — isolated changes

### Phase 3: Backend Modularization

**Goal:** Introduce domain boundaries in backend

| Order | Task | Module | Rationale |
|-------|------|--------|-----------|
| 3.1 | Create module structure | all | Establish boundaries |
| 3.2 | Move user-related code | user | First domain module |
| 3.3 | Move lesson-related code | lesson | Second domain module |
| 3.4 | Move game/scores code | game | Third domain module |
| 3.5 | Move statistics code | statistics | Fourth domain module |

**Dependencies:** Phase 1 & 2 complete
**Risk:** Medium — refactoring across modules

### Phase 4: Frontend Improvements

**Goal:** Migrate to feature-based architecture, fix deprecated deps

| Order | Task | Feature | Rationale |
|-------|------|---------|-----------|
| 4.1 | Migrate to Vite (from react-scripts) | build | Replace deprecated build tool |
| 4.2 | Create feature folder structure | all | New architecture |
| 4.3 | Move auth to features | auth | First feature module |
| 4.4 | Move lessons to features | lessons | Second feature module |
| 4.5 | Move games to features | games | Third feature module |
| 4.6 | Remove npm/i from dependencies | build | Clean up package.json |

**Dependencies:** Phase 1 (auth must work)
**Risk:** Medium — changes build system and folder structure

### Phase 5: Polish & Optimization

**Goal:** Production readiness, performance

| Order | Task | Rationale |
|-------|------|-----------|
| 5.1 | Reduce debug logging in production | Performance & security |
| 5.2 | Add request/response logging | Observability |
| 5.3 | Implement caching strategy | Performance |
| 5.4 | Add integration tests | Stability |

**Dependencies:** All phases complete
**Risk:** Low — optimization only

## Scalability Considerations

| Concern | Current (100 users) | Target (1K users) | Future (10K users) |
|---------|---------------------|-------------------|-------------------|
| **Database** | Single PostgreSQL | Read replicas if needed | Connection pooling, sharding |
| **Backend** | Single instance | Load balancer + 2-3 instances | Auto-scaling group |
| **Frontend** | Static hosting | CDN + caching | Edge caching |
| **Auth** | Local JWT | Token refresh | Consider OAuth2 provider |

## Architecture Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Instead |
|--------------|---------|---------|
| **Package by layer** | All user code scattered across Controller/Service/Repository folders | Package by domain/module |
| **Returning null** | Causes NullPointerException, unclear errors | Throw specific exceptions |
| **PermitAll endpoints** | No security, data exposure | Role-based access control |
| **Hardcoded config** | Security risk, deployment issues | Environment variables |
| **Type-based frontend folders** | Components/utils grow unmaintainably | Feature-based organization |

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Backend modularization | HIGH | Spring Modulith is well-documented, stable approach |
| Feature-based frontend | HIGH | Industry standard, extensively documented |
| Build order | MEDIUM | Phased approach is safe, but some phases could be parallelized |
| Scalability targets | MEDIUM | Based on typical educational platform patterns |

## Sources

- [Spring Modulith Introduction (Spring.io, 2022)](https://spring.io/blog/2022/10/21/introducing-spring-modulith) — HIGH
- [Modular Monolith Structure in Spring Boot (Medium, 2026)](https://medium.com/@AlexanderObregon/modular-monolith-structure-in-spring-boot-backends-24c10c9b8b07) — HIGH
- [Clean Architecture with Spring Boot (Vocal Media, 2026)](https://vocal.media/education/clean-architecture-with-spring-boot) — MEDIUM
- [Frontend Architecture Patterns (Medium, 2026)](https://medium.com/@udarasenarath/frontend-architecture-patterns-a-practical-guide-to-structuring-react-applications-that-scale-9af2701a6f0f) — HIGH
- [Feature-Sliced Design](https://feature-sliced.design/blog/scalable-react-architecture) — HIGH
- [Building Scalable React Architecture (OneUptime, 2026)](https://oneuptime.com/blog/post/2026-01-15-structure-large-scale-react-applications/view) — HIGH
