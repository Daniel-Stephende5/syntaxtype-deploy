# Codebase Structure

**Analysis Date:** 2026-03-14

## Directory Layout

```
syntaxtype-deploy/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/syntaxtype/demo/
│   │   ├── Controller/         # REST API controllers
│   │   ├── Service/           # Business logic
│   │   ├── Repository/        # JPA repositories
│   │   ├── Entity/            # JPA entities
│   │   ├── DTO/               # Data Transfer Objects
│   │   ├── Exception/         # Exception handlers
│   │   └── Controller/auth/security/  # JWT security
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── utils/             # Utilities
│   │   ├── css/               # Stylesheets
│   │   ├── App.js             # Main app with routing
│   │   ├── index.js           # Entry point
│   │   └── setupProxy.js      # Dev proxy config
│   ├── package.json
│   └── public/
├── .vscode/                   # VS Code settings
└── .planning/codebase/        # Analysis documents
```

## Backend Directory Purposes

**Controller Directory:**
- Purpose: Handle HTTP requests and define REST API endpoints
- Contains: REST controllers organized by domain
- Key files:
  - `AuthController.java` - `/api/auth/*` endpoints
  - `UserController.java` - User management
  - `LessonsController.java` - Lesson CRUD
  - `StudentController.java` - Student operations
  - `TeacherController.java` - Teacher operations

**Service Directory:**
- Purpose: Business logic and orchestration
- Contains: Service classes with `@Service` annotation
- Key files:
  - `users/` - UserService, StudentService, TeacherService, AdminService
  - `lessons/` - LessonsService, QuizService, ChallengeService
  - `statistics/` - ScoringService, LeaderboardService, AchievementsService

**Repository Directory:**
- Purpose: Data access layer using JPA
- Contains: Repository interfaces extending JpaRepository
- Key files:
  - `users/UserRepository.java`
  - `lessons/LessonsRepository.java`
  - `statistics/ScoringRepository.java`

**Entity Directory:**
- Purpose: Database table mappings
- Contains: JPA entities with annotations
- Key files:
  - `Users/User.java` - Base user entity
  - `Users/Student.java` - Student profile
  - `Users/Teacher.java` - Teacher profile
  - `Lessons/Lessons.java` - Lesson content
  - `Statistics/Scoring.java` - Score records
  - `Enums/Role.java` - ADMIN, TEACHER, STUDENT, USER

**DTO Directory:**
- Purpose: Data transfer objects for API communication
- Contains: POJOs for requests/responses
- Key files:
  - `users/UserDTO.java`
  - `lessons/LessonsDTO.java`
  - `statistics/ScoringDTO.java`

**Exception Directory:**
- Purpose: Custom exception handling
- Key files:
  - `GlobalExceptionHandler.java`
  - `RestExceptionHandler.java`
  - `UsernameConflictException.java`

## Frontend Directory Purposes

**Pages Directory:**
- Purpose: Full-page components mapped to routes
- Contains: React components for each page/view
- Key files:
  - `LoginPage.js` - Authentication
  - `RegisterPage.js` - User registration
  - `Dashboard.js` - Main dashboard
  - `TypingTest.js` - Typing practice game
  - `FallingTypingTest.js` - Falling words typing game
  - `GalaxyGame/GalaxyMainGame.js` - Galaxy space game
  - `InstructorModule.js` - Teacher lesson management
  - `CreateLessonModule.js` - Create new lessons
  - `AdminManageUsers.js` - Admin user management

**Components Directory:**
- Purpose: Reusable UI components
- Key files:
  - `Navbar.js` - Navigation header
  - `ProtectedRoute.js` - Route guard with role checking
  - `PublicOnlyRoute.js` - Guest-only route guard
  - `NotFoundRedirect.js` - 404 handler
  - `Dashboard.js` - Dashboard layout
  - `AdminDashboard.js` - Admin-specific layout

**Utils Directory:**
- Purpose: Utility functions and API helpers
- Key files:
  - `api.js` - API URL resolution (`API_BASE`, `resolveApi()`)
  - `AuthUtils.js` - Token management, axios header setup
  - `JwtUtils.js` - JWT decoding, expiry validation

**CSS Directory:**
- Purpose: Component-specific stylesheets
- Files: `typingtest.css`, `TotalDashboard.css`, etc.

## Key File Locations

**Entry Points:**
- Backend: `backend/src/main/java/com/syntaxtype/demo/DemoApplication.java`
- Frontend: `frontend/src/index.js`

**Configuration:**
- Backend: `backend/src/main/resources/application.properties`
- Frontend proxy: `frontend/src/setupProxy.js`
- Frontend env: `frontend/.env`

**Routing:**
- Frontend: `frontend/src/App.js` - All route definitions

**Authentication:**
- Backend JWT: `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/JwtUtil.java`
- Backend Security: `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/SecurityConfig.java`
- Frontend Auth: `frontend/src/utils/AuthUtils.js`

## Naming Conventions

**Files:**
- Java: PascalCase (e.g., `UserService.java`, `LessonsController.java`)
- JavaScript/JSX: PascalCase (e.g., `LoginPage.js`, `ProtectedRoute.js`)
- CSS: kebab-case (e.g., `typingtest.css`, `TotalDashboard.css`)

**Directories:**
- Java packages: lowercase with subdirectories (e.g., `Service/users/`)
- Frontend: PascalCase for components, lowercase for utilities

**Java Classes:**
- Controllers: `*Controller.java`
- Services: `*Service.java`
- Repositories: `*Repository.java`
- Entities: Entity name (e.g., `User.java`, `Lessons.java`)
- DTOs: `*DTO.java`

## Where to Add New Code

**New Backend Feature:**
1. Create Entity in `Entity/` if new database table needed
2. Create DTO in `DTO/` for API communication
3. Create Repository in `Repository/`
4. Create Service in `Service/`
5. Create Controller in `Controller/`
6. Add exception handling if needed in `Exception/`

**New Frontend Feature:**
1. Create page component in `pages/` if new route needed
2. Create reusable components in `components/`
3. Add utility functions in `utils/` if needed
4. Add route in `App.js` with ProtectedRoute wrapper

**New API Endpoint:**
1. Add method to existing Controller or create new Controller
2. Implement logic in Service layer
3. Query/persist data via Repository
4. Return DTO to frontend

**New Database Entity:**
1. Create Entity class with JPA annotations
2. Use Lombok annotations for getters/setters
3. Create corresponding DTO
4. Create Repository interface
5. Add Service method to interact with Repository

## Special Directories

**Backend Controller/auth/security:**
- Purpose: JWT authentication and Spring Security configuration
- Contains: JwtUtil, JwtAuthFilter, SecurityConfig, CustomUserDetailsService, JwtResponse

**Frontend pages/GalaxyGame:**
- Purpose: Complex game component with multiple sub-files
- Contains: GalaxyMainGame.js, GalaxyChallengeList.js, GalaxyEnemy.js, GalaxyControls.js, etc.

**backend/target:**
- Purpose: Maven build output (generated)
- Generated: Yes
- Committed: No (should be in .gitignore)

---

*Structure analysis: 2026-03-14*
