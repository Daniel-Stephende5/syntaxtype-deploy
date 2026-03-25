# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
syntaxtype-deploy/
├── .planning/                    # GSD planning documents
│   └── codebase/
├── backend/                      # Spring Boot application
│   ├── src/main/java/com/syntaxtype/demo/
│   │   ├── Controller/          # REST controllers
│   │   ├── Service/              # Business logic
│   │   ├── Repository/           # Data access
│   │   ├── Entity/               # JPA entities
│   │   ├── DTO/                  # Data transfer objects
│   │   └── Exception/            # Exception handlers
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/                 # Test sources
│   ├── pom.xml                   # Maven dependencies
│   └── Dockerfile
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── utils/                # Utility functions
│   │   ├── css/                  # Stylesheets
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # Entry point
│   │   └── *.config.js           # Configuration files
│   ├── public/                   # Static assets
│   ├── package.json
│   └── tailwind.config.js
└── p/                             # Parent directory marker
```

## Directory Purposes

### Backend (`backend/`)

**Controller Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Controller/`
- Contains: REST endpoint handlers organized by feature
- Subdirectories:
  - `auth/` - Authentication and security (AuthController, JwtUtil, SecurityConfig)
  - `users/` - User CRUD operations (UserController, StudentController, TeacherController)
  - `lessons/` - Lesson content management
  - `statistics/` - Statistics and leaderboards
  - `junctions/` - Many-to-many relationship handlers

**Service Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Service/`
- Contains: Business logic classes
- Subdirectories mirror Controller organization:
  - `users/` - UserService, StudentService, TeacherService, AdminService
  - `lessons/` - LessonsService, QuizService, TopicsService, ChallengeService
  - `statistics/` - ScoringService, AchievementsService, LeaderboardService
  - `junctions/` - StudentTopicsService, TeacherTopicsService

**Repository Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Repository/`
- Contains: JPA repository interfaces
- Pattern: `JpaRepository<Entity, Long>` with custom query methods

**Entity Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Entity/`
- Contains: JPA entity classes
- Subdirectories:
  - `Users/` - User, Student, Teacher, Admin
  - `Lessons/` - Lessons, Topics, Quiz, QuizItem, Challenge, GalaxyChallenge
  - `Statistics/` - UserStatistics, Achievements, LessonAttempts, Scoring, Leaderboard
  - `Junctions/` - StudentTopics, TeacherTopics (join tables)
  - `Enums/` - Role, ChallengeType, Category
  - `CompositeKeys/` - TeacherTopicsId, StudentTopicsId
  - `Lessons/GalaxyChallengeClasses/` - Question, Choice, QuestionTypes

**DTO Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/DTO/`
- Contains: Data Transfer Objects
- Pattern: Separate subdirectories for different entity types
  - `users/` - UserDTO, TeacherDTO, StudentDTO
  - `lessons/` - TopicsDTO, GalaxyChallengeDTO
  - `users/requests/` - TempTeacherUpdate
  - `users/responses/` - AccountSetupResponse

**Exception Layer:**
- Location: `backend/src/main/java/com/syntaxtype/demo/Exception/`
- Contains: Custom exception classes and handlers
  - `GlobalExceptionHandler.java`
  - `RestExceptionHandler.java`
  - `UsernameConflictException.java`

### Frontend (`frontend/`)

**Components:**
- Location: `frontend/src/components/`
- Contains: Reusable React components
- Key files:
  - `Navbar.js` - Navigation bar with responsive sidebar
  - `ProtectedRoute.js` - Route guard with role checking
  - `PublicOnlyRoute.js` - Redirects logged-in users from public pages
  - `NotFoundRedirect.js` - 404 handler
  - `Dashboard.js` - Main dashboard component
  - `AdminDashboard.js` - Admin-specific dashboard
  - `AdminManageUsers.js` - User management interface

**Pages:**
- Location: `frontend/src/pages/`
- Contains: Route-specific page components
- Key pages:
  - `LoginPage.js` - User login
  - `RegisterPage.js` - User registration
  - `Dashboard.js` - Main dashboard
  - `TypingTest.js` - Typing practice
  - `FallingTypingTest.js` / `AdvancedFallingTypingTest.js` - Falling words typing
  - `QuizMenu.js` - Quiz selection
  - `GalaxyGame/` - Galaxy challenge subfolder
    - `GalaxyMainGame.js` - Main game component
    - `GalaxyChallengeList.js` - Challenge selection
    - `GalaxyEnemy.js`, `GalaxyControls.js`, `GalaxyPowerup.js` - Game elements
  - `GridGame.js` - Grid-based puzzle game
  - `Bookworm.js` - Reading comprehension game
  - `CrosswordGame.js` - Crossword puzzle
  - `LeaderboardPage.js` - Public leaderboard
  - `ChallengePage.js` - Challenge management
  - `LessonDetail.js` - Lesson viewer
  - `CreateLessonModule.js` / `EditLessonModule.js` - Lesson CRUD
  - `AllLessonsView.js` - Lesson listing
  - `InstructorModule.js` - Instructor dashboard
  - `StudentDetailsForm.js` / `TeacherDetailsForm.js` - Profile forms
  - `StudentStatisticsPage.js` / `PersonalStatsDashboard.js` - Statistics views
  - `codeChallenges.js`, `judge0.js` - Code execution integration
  - `map.js`, `usePlayer.js` - Game utilities

**Utilities:**
- Location: `frontend/src/utils/`
- Key files:
  - `api.js` - API URL resolution with environment fallback
  - `AuthUtils.js` - Token management (setAuthToken, getAuthToken, subscribeToAuthChanges)
  - `JwtUtils.js` - JWT decoding and validation (getUserRole, getUserId, getUsername)

**Configuration:**
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `setupProxy.js` - Development proxy configuration

## Key File Locations

**Entry Points:**
- `backend/src/main/java/com/syntaxtype/demo/DemoApplication.java` - Spring Boot main class
- `frontend/src/index.js` - React entry point
- `frontend/src/App.js` - Main React component with routing

**Configuration:**
- `backend/src/main/resources/application.properties` - Spring Boot configuration
- `frontend/package.json` - npm dependencies and scripts
- `backend/pom.xml` - Maven dependencies

**Core Logic:**
- `backend/src/main/java/com/syntaxtype/demo/Controller/auth/AuthController.java` - Authentication
- `frontend/src/pages/LoginPage.js` - Login UI
- `frontend/src/utils/AuthUtils.js` - Client-side auth

## Naming Conventions

**Backend (Java):**
- Files: PascalCase (`UserController.java`, `UserService.java`)
- Directories: camelCase (`Controller/users/`)
- Classes: PascalCase
- Methods: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

**Frontend (JavaScript/React):**
- Files: PascalCase for components (`LoginPage.js`), camelCase for utilities (`authUtils.js`)
- Directories: camelCase or kebab-case
- Components: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE

## Where to Add New Code

### Backend

**New Entity:**
1. Create entity class in `backend/src/main/java/com/syntaxtype/demo/Entity/<Category>/`
2. Create corresponding repository in `Repository/<Category>/`
3. Create service in `Service/<Category>/`
4. Create DTO in `DTO/<Category>/`
5. Create controller in `Controller/<Category>/`

**New API Endpoint:**
1. Add method to existing controller or create new controller
2. Use `@GetMapping`, `@PostMapping`, etc.
3. Add `@PreAuthorize` for protected endpoints
4. Document with `@ApiResponses` for Swagger

### Frontend

**New Page:**
1. Create file in `frontend/src/pages/`
2. Import in `frontend/src/App.js`
3. Add Route with appropriate `ProtectedRoute` wrapper

**New Component:**
1. Create file in `frontend/src/components/`
2. Import and use in page components

**New API Utility:**
1. Add function to `frontend/src/utils/api.js`
2. Use existing `API_BASE` for URL resolution

## Special Directories

**GalaxyGame Subdirectory:**
- Purpose: Galaxy challenge game implementation
- Contains: Main game, enemy, controls, powerups, events, background, assets
- Structure: Modular game architecture

**DTO Subdirectories:**
- Purpose: Organized DTOs by entity type
- Contains: users, lessons, nested requests/responses

**Junction Tables:**
- Purpose: Many-to-many relationships (StudentTopics, TeacherTopics)
- Contains: Composite key classes for composite primary keys

---

*Structure analysis: 2026-03-25*
