# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Layered Architecture with RESTful API

**Key Characteristics:**
- Backend follows Spring Boot MVC pattern with Repository/Service/Controller layers
- Frontend uses React SPA with client-side routing
- JWT-based stateless authentication
- Role-based access control (RBAC) with four roles: USER, ADMIN, TEACHER, STUDENT
- Backend exposes RESTful API consumed by React frontend

## Layers

### Backend (Spring Boot)

**Presentation Layer (Controllers):**
- Location: `backend/src/main/java/com/syntaxtype/demo/Controller/`
- Contains: REST controllers handling HTTP requests
- Depends on: Service layer
- Used by: Frontend via REST API calls
- Pattern: `@RestController` with `@RequestMapping` for route organization

**Service Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Service/`
- Contains: Business logic classes (`*Service.java`)
- Depends on: Repository layer
- Used by: Controllers
- Pattern: `@Service` annotation with `@RequiredArgsConstructor` for dependency injection

**Repository Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Repository/`
- Contains: JPA repository interfaces extending `JpaRepository`
- Depends on: JPA/Hibernate
- Used by: Service layer
- Pattern: Spring Data JPA with custom query methods

**Entity Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Entity/`
- Contains: JPA entity classes mapped to database tables
- Used by: Repository layer for ORM mapping
- Pattern: Lombok annotations (`@Getter`, `@Setter`, `@Builder`)

**DTO Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/DTO/`
- Contains: Data Transfer Objects for API communication
- Purpose: Separate internal entity structure from API contracts
- Pattern: Immutable DTOs with Lombok `@Data`, `@Builder`

### Frontend (React)

**Component Layer:**
- Location: `frontend/src/components/`
- Contains: Reusable UI components (Navbar, Dashboard, ProtectedRoute, etc.)
- Pattern: Functional React components with hooks

**Page Layer:**
- Location: `frontend/src/pages/`
- Contains: Route-specific page components
- Pattern: Container components that fetch data and render children

**Utility Layer:**
- Location: `frontend/src/utils/`
- Contains: `api.js` (API URL resolution), `AuthUtils.js` (token management), `JwtUtils.js` (JWT decoding)
- Pattern: Pure JavaScript utility functions

## Data Flow

**Authentication Flow:**
1. User submits login credentials via `LoginPage.js`
2. Axios POST to `/api/auth/login`
3. `AuthController.loginUser()` validates credentials
4. `JwtUtil.generateToken()` creates JWT with userId, role, isTempPassword claims
5. Frontend stores token in localStorage via `setAuthToken()`
6. Subsequent requests include `Authorization: Bearer <token>` header

**Protected Route Flow:**
1. `ProtectedRoute.js` component wraps protected routes
2. On mount, checks localStorage for JWT token
3. Decodes JWT to extract role, userId, isTempPassword
4. Validates role against `allowedRoles` prop
5. For STUDENT: checks if profile exists via `/api/students/user/{userId}`
6. For TEACHER: checks if profile exists via `/api/teachers/user/{userId}`
7. Redirects to appropriate form if profile incomplete

**CRUD Operations:**
1. Controller receives HTTP request with `@RequestBody` DTO
2. Service layer processes business logic
3. Repository layer performs database operations via JPA
4. Response returned as DTO via `ResponseEntity`

## Key Abstractions

**User Entity Hierarchy:**
- `User.java` - Base user entity with common fields (username, email, password, role)
- `Student.java` - Extends User with student-specific profile data
- `Teacher.java` - Extends User with teacher-specific profile data
- `Admin.java` - Extends User for admin users
- Pattern: Role discriminator in User entity, separate tables for profiles

**Lesson/Content System:**
- `Lessons.java` - Core lesson content entity
- `Topics.java` - Lesson categorization
- `Quiz.java` / `QuizItem.java` - Quiz questions
- `Challenge.java` / `GalaxyChallenge.java` - Coding challenges
- Pattern: One-to-many relationships between Topics and Lessons

**Statistics System:**
- `UserStatistics.java` - Per-user statistics
- `Achievements.java` / `StudentAchievements.java` - Achievement definitions and unlocks
- `LessonAttempts.java` - Track lesson completions
- `Leaderboard.java` - Aggregated leaderboard data
- `Scoring.java` - Score records

## Entry Points

**Backend Entry Point:**
- Location: `backend/src/main/java/com/syntaxtype/demo/DemoApplication.java`
- Triggers: Application startup via `SpringApplication.run()`
- Responsibilities: Application bootstrap, admin user creation, initial data seeding

**Frontend Entry Point:**
- Location: `frontend/src/index.js`
- Triggers: React app initialization
- Responsibilities: Renders `App.js` component, mounts to DOM

**Frontend App Router:**
- Location: `frontend/src/App.js`
- Triggers: Browser navigation
- Responsibilities: Route definition with ProtectedRoute/PublicOnlyRoute wrappers

## API Design

**Base Path:** `/api`

**Authentication Endpoints:**
- `POST /api/auth/register` - Public user registration
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/teacher` - Teacher registration (ADMIN only)
- `POST /api/auth/login` - User login, returns JWT

**User Endpoints:**
- `GET /api/users` - List all users (ADMIN only)
- `GET /api/users/id/{userId}` - Get user by ID
- `PATCH /api/users/{userId}/email` - Update email
- `DELETE /api/users/{id}` - Delete user

**Statistics Endpoints:**
- `GET /api/statistics/leaderboard` - Public leaderboard
- `GET /api/statistics/user-stats/{userId}` - User statistics
- `POST /api/statistics/scoring` - Submit score

## Error Handling

**Backend Strategy:**
- `GlobalExceptionHandler.java` - Catches unhandled exceptions
- `RestExceptionHandler.java` - REST-specific error responses
- `UsernameConflictException.java` - Custom business exception
- Pattern: `@ExceptionHandler` methods returning `ResponseEntity`

**Frontend Strategy:**
- Axios catch blocks handle API errors
- Error messages displayed via Alert components
- 401/403 responses trigger redirect to login

## Cross-Cutting Concerns

**Authentication:** Spring Security with JWT tokens (currently partially disabled in SecurityConfig)
**Authorization:** `@PreAuthorize` annotations on controller methods
**CORS:** Configured for localhost:3000, localhost:5173, Vercel deployment
**Logging:** Spring Boot logging with DEBUG level for security and web filters
**Database:** PostgreSQL via Render deployment, JPA/Hibernate ORM

---

*Architecture analysis: 2026-03-25*
