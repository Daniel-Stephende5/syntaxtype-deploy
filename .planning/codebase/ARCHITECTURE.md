# Architecture

**Analysis Date:** 2026-03-14

## Pattern Overview

**Overall:** Spring Boot REST API Backend + React SPA Frontend with JWT Authentication

**Key Characteristics:**
- Monolithic Spring Boot backend exposing REST APIs
- React frontend using react-router-dom for navigation
- JWT-based stateless authentication with role-based access control (RBAC)
- PostgreSQL database with JPA/Hibernate ORM
- CORS-enabled communication between frontend and backend

## Layers

**Backend (Spring Boot):**
```
com.syntaxtype.demo/
├── Controller/     # REST API endpoints
├── Service/       # Business logic
├── Repository/     # Data access (JPA)
├── Entity/        # JPA entities/database models
├── DTO/           # Data Transfer Objects
├── Exception/     # Custom exception handling
└── Controller/auth/security/  # JWT & Security
```

**Frontend (React):**
```
frontend/src/
├── pages/         # Page components (routes)
├── components/    # Reusable UI components
├── utils/         # API, Auth, JWT utilities
└── css/           # Stylesheets
```

### Backend Layers

**Controller Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Controller/`
- Handles HTTP requests/responses
- Uses `@RestController` and `@RequestMapping` annotations
- Delegates to Service layer
- Examples:
  - `AuthController.java` - `/api/auth/*` - Login, registration
  - `UserController.java` - `/api/users/*` - User CRUD
  - `LessonsController.java` - `/api/lessons/*` - Lessons management

**Service Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Service/`
- Contains business logic
- Uses `@Service` annotation
- Coordinates between Controller and Repository
- Examples:
  - `UserService.java` - User management, role assignment
  - `LessonsService.java` - Lesson CRUD operations
  - `ScoreService.java` - Scoring logic

**Repository Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Repository/`
- Extends `JpaRepository` for CRUD operations
- Contains custom query methods
- Examples:
  - `UserRepository.java` - User data access
  - `LessonsRepository.java` - Lesson queries

**Entity Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Entity/`
- JPA entities mapped to database tables
- Uses Lombok for boilerplate reduction
- Examples:
  - `User.java` - Users table
  - `Lessons.java` - Lessons table
  - `Role.java` - Enum for user roles (ADMIN, TEACHER, STUDENT, USER)

**DTO Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/DTO/`
- Data transfer objects for API requests/responses
- Separates internal entities from external API contracts
- Examples:
  - `UserDTO.java` - User data transfer
  - `LessonsDTO.java` - Lesson data transfer

### Frontend Layers

**Page Components:**
- Location: `frontend/src/pages/`
- Full page views mapped to routes
- Contains business logic specific to the page
- Examples:
  - `LoginPage.js` - Authentication
  - `TypingTest.js` - Typing game
  - `Dashboard.js` - User dashboard

**Reusable Components:**
- Location: `frontend/src/components/`
- Shared UI components
- Examples:
  - `Navbar.js` - Navigation header
  - `ProtectedRoute.js` - Route guards
  - `AdminManageUsers.js` - Admin functionality

**Utilities:**
- Location: `frontend/src/utils/`
- `api.js` - API URL resolution
- `AuthUtils.js` - Token storage and axios header management
- `JwtUtils.js` - JWT decoding and validation

## Data Flow

**Authentication Flow:**

1. User submits login credentials via `LoginPage.js`
2. Axios POST to `/api/auth/login`
3. `AuthController.loginUser()` validates credentials
4. `UserService.findByEmail()` retrieves user
5. `BCryptPasswordEncoder` matches password
6. `JwtUtil.generateToken()` creates JWT with role, userId, isTempPassword claims
7. Token returned to frontend
8. `AuthUtils.setAuthToken()` stores in localStorage and sets axios header
9. `ProtectedRoute` validates token and role on each protected route

**API Request Flow:**

1. Frontend component calls API via axios
2. Token included in Authorization header
3. Backend `JwtAuthFilter` (if enabled) validates token
4. `CustomUserDetailsService` loads user details
5. Spring Security sets authentication context
6. Controller receives authenticated request
7. Service processes business logic
8. Repository interacts with PostgreSQL
9. Response flows back through layers

**Lesson Creation Flow:**

1. Teacher navigates to `/lesson` (ProtectedRoute validates TEACHER role)
2. `CreateLessonModule.js` form submits to `/api/lessons`
3. `LessonsController.createLesson()` receives LessonsDTO
4. `LessonsService.save()` converts DTO to Entity
5. `LessonsRepository.save()` persists to PostgreSQL
6. Saved entity converted back to DTO and returned

## Key Abstractions

**User Roles:**
- ADMIN - Full system access, user management
- TEACHER - Create lessons, challenges, view students
- STUDENT - Take lessons, play games, track progress
- USER - Basic authenticated user

**API Design:**
- RESTful endpoints with standard HTTP methods
- JSON request/response bodies
- DTOs for input/output validation
- Role-based endpoint protection via `@PreAuthorize`

**State Management:**
- JWT stored in localStorage
- Session data in sessionStorage (userId, role, token)
- React Context not heavily used
- Route-based conditional rendering via ProtectedRoute

## Entry Points

**Backend:**
- Location: `backend/src/main/java/com/syntaxtype/demo/DemoApplication.java`
- Main method: `SpringApplication.run(DemoApplication.class, args)`
- Runs on port 8080 (configurable via PORT env var)
- CommandLineRunner beans for initialization:
  - Creates default admin user
  - Creates sample Galaxy Challenge

**Frontend:**
- Location: `frontend/src/index.js`
- Renders React app into DOM
- `App.js` contains Router and all routes
- Development server on port 3000 (via react-scripts)

## Error Handling

**Backend:**
- Custom `GlobalExceptionHandler` or `RestExceptionHandler`
- Returns proper HTTP status codes (400, 401, 404, 409, 500)
- `@ControllerAdvice` for centralized exception handling

**Frontend:**
- Axios catch blocks handle API errors
- Error state displayed to users via Alert components
- ProtectedRoute handles auth failures with redirects

## Cross-Cutting Concerns

**Authentication:** JWT with BCrypt password encoding
- `JwtUtil.java` - Token generation/validation
- `CustomUserDetailsService.java` - User loading
- `SecurityConfig.java` - CORS, session policy, endpoint protection

**Logging:**
- Configured in `application.properties`
- `logging.level.backend=DEBUG`
- Spring Security debug logging enabled

**CORS:**
- Configured in `SecurityConfig.java`
- Allowed origins: localhost:3000, localhost:5173, syntaxtype-deploy-omega.vercel.app
- Credentials allowed, exposed Authorization header

---

*Architecture analysis: 2026-03-14*
