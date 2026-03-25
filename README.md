# SyntaxType - Educational Typing Platform

An educational typing practice platform built with Spring Boot and React, featuring multiple typing games, lesson management, and user progress tracking.

## Features

### Typing Games
Eight unique game modes to practice and improve typing skills:

| Game | Description | Focus |
|------|-------------|-------|
| **Typing Test** | Complete code snippets by filling in blanks | Code accuracy |
| **Falling Words** | Type falling words before they reach the bottom | Speed |
| **Galaxy Game** | Space shooter game with typing challenges | Fun practice |
| **Grid Game** | Find and type words in a letter grid | Vocabulary |
| **Bookworm** | Build valid words from random letters | Word building |
| **Crossword** | Classic crossword puzzle gameplay | Pattern recognition |
| **Four Pics** | Guess and type the word shown in four pictures | Association |
| **Syntax Saver** | Fix buggy code snippets by typing corrections | Programming |

### Leaderboards
- Global rankings across all games
- Game-specific leaderboards with filtering
- Personal best tracking with WPM and accuracy metrics
- Combined score calculation: `WPM × Accuracy × 1.5` (for accuracy > 95%)

### User Management
- Role-based accounts: Students, Teachers, Administrators
- JWT authentication
- Progress tracking per user

### Lesson System
- Teachers can create custom lessons
- Quiz functionality with multiple question types
- Syntax highlighting for code content

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.4.4, Java 17 |
| Frontend | React 18.2.0, React Router 6, Material UI |
| Database | PostgreSQL 14+ (via JPA/Hibernate) |
| Authentication | JWT (HS256) |
| Build | Maven 3.8+ (backend), npm (frontend) |
| Deployment | Vercel (frontend), Railway/Render (backend) |

## Screenshots

> TODO: Add screenshots of each game mode and the leaderboard

<!---
Insert screenshots here:
- Leaderboard page
- Typing test gameplay
- Galaxy game
- Admin dashboard
-->

## Installation

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 17+ | Required for Spring Boot |
| Node.js | 18+ | Required for React |
| PostgreSQL | 14+ | Database |
| Maven | 3.8+ | Backend build |

### 1. Clone the Repository

```bash
git clone https://github.com/Daniel-Stephende5/syntaxtype-deploy.git
cd syntaxtype-deploy
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE syntaxtype;
\q

# Update application.properties with your credentials
# See Configuration section below
```

### 3. Backend Setup

```bash
cd backend

# Configure environment variables
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your database credentials

# Run the application
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_BASE_URL=http://localhost:8080" > .env

# Start development server
npm start
```

The frontend runs on `http://localhost:3000`.

### Docker Setup (Alternative)

```bash
# Backend with Docker
cd backend
docker build -t syntaxtype-backend .
docker run -p 8080:8080 --env-file .env syntaxtype-backend

# Frontend with Docker
cd frontend
docker build -t syntaxtype-frontend .
docker run -p 3000:3000 syntaxtype-frontend
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Clear npm cache: `npm cache clean --force` |
| CORS errors | Ensure backend CORS is configured for frontend URL |
| Database connection failed | Verify PostgreSQL is running and credentials are correct |
| JWT errors | Ensure `JWT_SECRET` is set and at least 32 characters |
| Port already in use | Change port in `application.properties` or kill the process |

## Database

PostgreSQL with JPA/Hibernate (auto-creates tables on startup).

See [DATABASE.md](DATABASE.md) for full schema documentation including:
- All 20+ tables and columns
- Entity relationships
- Schema diagram
- Normalization notes

## Configuration

### Environment Variables

Create a `.env` file or set these environment variables:

**Backend (`backend/.env`):**
```env
DB_URL=jdbc:postgresql://localhost:5432/syntaxtype
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_256_bit_secret_key_here_at_least_32_characters
JWT_EXPIRATION=900000
CORS_ORIGINS=http://localhost:3000
```

**Frontend (`frontend/.env`):**
```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Application Properties

Key configurations in `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:900000}

# CORS
cors.origins=${CORS_ORIGINS:http://localhost:3000}
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "student1",
  "email": "student1@example.com",
  "password": "securePassword123",
  "role": "STUDENT"
}

Response (201):
{
  "id": 1,
  "username": "student1",
  "email": "student1@example.com",
  "role": "STUDENT"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student1",
  "password": "securePassword123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "username": "student1",
  "role": "STUDENT"
}
```

### Leaderboards

#### Get Global Leaderboard
```http
GET /api/leaderboards/global?metric=wpm
GET /api/leaderboards/global?metric=accuracy
GET /api/leaderboards/global?metric=combined

Response (200):
{
  "entries": [
    {
      "rank": 1,
      "username": "toptypist",
      "wpm": 120,
      "accuracy": 98,
      "combinedScore": 176.4,
      "gameName": "TYPING_TESTS",
      "dateAchieved": "2026-03-25T10:30:00"
    }
  ],
  "total": 150
}
```

#### Get Game-Specific Leaderboard
```http
GET /api/leaderboards/game/TYPING_TESTS?metric=combined

Response (200):
{
  "entries": [...],
  "total": 50
}
```

#### Get User's Rankings
```http
GET /api/leaderboards/user/1
Authorization: Bearer {token}

Response (200):
{
  "rankings": [
    {
      "gameName": "TYPING_TESTS",
      "bestWpm": 95,
      "bestAccuracy": 97,
      "combinedScore": 138.3,
      "rank": 12
    }
  ]
}
```

### Score Submission

#### Submit Score
```http
POST /api/scores/{category}
Authorization: Bearer {token}
Content-Type: application/json

{
  "wpm": 85,
  "accuracy": 96,
  "score": 816,
  "timeSpent": 120
}

Response (200):
{
  "success": true,
  "isNewBest": true,
  "rank": 5
}
```

**Valid Categories:**
- `TYPING_TESTS`
- `FALLING_WORDS`
- `GALAXY`
- `GRID`
- `BOOKWORM`
- `CROSSWORD`
- `FOUR_PICS`
- `SYNTAX_SAVER`

### Error Responses

| Status | Meaning | Response |
|--------|---------|----------|
| 400 | Bad Request | `{"error": "Invalid category"}` |
| 401 | Unauthorized | `{"error": "Invalid or expired token"}` |
| 403 | Forbidden | `{"error": "Access denied"}` |
| 404 | Not Found | `{"error": "Resource not found"}` |
| 500 | Server Error | `{"error": "Internal server error"}` |

## Project Structure

```
syntaxtype-deploy/
├── backend/                         # Spring Boot backend
│   ├── src/main/java/com/syntaxtype/demo/
│   │   ├── Controller/              # REST API endpoints
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   ├── lessons/             # Lesson & score endpoints
│   │   │   └── statistics/          # Leaderboard endpoints
│   │   ├── Service/                 # Business logic
│   │   ├── Repository/              # Data access (JPA)
│   │   ├── Entity/                  # JPA entities & enums
│   │   ├── DTO/                     # Request/Response DTOs
│   │   ├── Security/                # JWT & security config
│   │   └── Exception/               # Exception handlers
│   └── src/main/resources/
│       └── application.properties   # App configuration
├── frontend/                        # React frontend
│   ├── public/                      # Static assets
│   └── src/
│       ├── api/                     # API client
│       ├── components/              # Reusable UI components
│       ├── hooks/                   # Custom React hooks
│       ├── pages/                   # Page components
│       │   ├── GalaxyGame/          # Game-specific components
│       │   └── ...
│       ├── utils/                   # Utility functions
│       └── App.js                   # Main app & routing
├── .planning/                       # Project planning docs
├── docker-compose.yml               # Docker setup
└── README.md
```

## Development

### Running Tests

**Backend:**
```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=LeaderboardServiceTest

# Run with coverage
mvn test jacoco:report
# Report at: target/site/jacoco/index.html
```

**Frontend:**
```bash
cd frontend

# Run tests (watch mode)
npm test

# Run tests once
npm test -- --watchAll=false

# Run with coverage
npm test -- --coverage --watchAll=false
```

**Test Types:**

| Layer | Type | Coverage |
|-------|------|----------|
| Backend | Unit Tests | Service layer |
| Backend | Integration Tests | API endpoints |
| Frontend | Unit Tests | Hooks & utils |
| Frontend | Component Tests | UI components |

### Building for Production

```bash
# Backend
cd backend
mvn clean package -DskipTests
# JAR at: target/demo-0.0.1-SNAPSHOT.jar
java -jar target/demo-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
# Build at: build/
# Serve with: npx serve -s build -l 3000
```

## Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Configure environment variables:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.com
   ```
3. Deploy automatically on push to main

### Backend (Railway/Render)

1. Create new Rails/Render project
2. Connect repository
3. Set environment variables:
   ```
   DB_URL=<railway-postgres-url>
   DB_USERNAME=<username>
   DB_PASSWORD=<password>
   JWT_SECRET=<your-secret>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
4. Deploy branch `main`

### Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# Scale backend
docker-compose up -d --scale backend=3
```

## Contributing

### Workflow

This project uses the **GSD (Get Shit Done)** workflow:

1. **Discuss** - Create issue or discuss in team
2. **Plan** - Create `.planning/phases/Xy-PLAN.md`
3. **Execute** - Implement with atomic commits
4. **Verify** - Run tests and verify builds

### Branch Naming

```
feature/leaderboard-backend
fix/typo-in-readme
refactor/score-service
docs/api-documentation
```

### Commit Messages

Follow conventional commits:

```
feat: add leaderboard endpoints
fix: resolve null pointer in score submission
docs: update API documentation
refactor: simplify leaderboard calculation
test: add unit tests for score service
```

### Pull Request Process

1. Create feature branch from `main`
2. Make atomic, well-documented commits
3. Ensure all tests pass
4. Update documentation if needed
5. Request review
6. Squash merge after approval

### Code Style

**Backend (Java):**
- Follow Spring Boot conventions
- Use Lombok for boilerplate
- Prefer constructor injection
- Add JavaDoc for public methods

**Frontend (React):**
- Functional components with hooks
- PropTypes for component props
- ES6+ syntax
- Prettier for formatting

## Changelog

### v1.0 (2026-03-25)

**Phase 1-3 Complete**

- ✅ Leaderboard system with global and game-specific rankings
- ✅ Combined score calculation with accuracy bonus
- ✅ All 8 games integrated with score submission
- ✅ Role-based user management
- ✅ Lesson and quiz system
- ✅ JWT authentication
- ✅ React 18 with Material UI frontend
- ✅ PostgreSQL database with optimized queries

## FAQ

### General

**Q: How do I create an account?**
A: Navigate to `/register` or use the Register button on the login page.

**Q: What roles are available?**
A: `STUDENT`, `TEACHER`, `ADMIN`. Students can play games, Teachers can create lessons, Admins manage users.

**Q: How is the combined score calculated?**
A: `WPM × (Accuracy/100) × 1.5` if accuracy > 95%, otherwise `WPM × (Accuracy/100)`.

### Technical

**Q: Why isn't my score saving?**
A: Ensure you're logged in. Scores only save for authenticated users.

**Q: The leaderboard isn't updating.**
A: Scores update when you beat your personal best. Check the `isNewBest` response.

**Q: CORS errors in development.**
A: Ensure backend's `application.properties` has `cors.origins=http://localhost:3000`.

**Q: Database connection failed.**
A: Verify PostgreSQL is running and credentials in `application.properties` are correct.

**Q: JWT token expired.**
A: Re-login to get a new token. Tokens expire after 15 minutes by default.

### Games

**Q: Can I replay a game to improve my score?**
A: Yes! Each game completion allows score submission. Only your best score counts for leaderboards.

**Q: How do I see all my scores?**
A: Navigate to the Leaderboard and filter by "My Scores" or visit `/api/leaderboards/user/{yourId}`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│   │  Games  │  │Lessons  │  │Profile  │  │  Leaderboards   │  │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘  │
│        │            │            │                 │            │
│        └────────────┴────────────┴─────────────────┘            │
│                           │                                      │
│                    REST API Client                               │
└───────────────────────────┼───────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼───────────────────────────────────────┐
│                    Backend (Spring Boot)                          │
│                           │                                        │
│   ┌──────────────────────┴──────────────────────┐               │
│   │              Security (JWT Filter)            │               │
│   └──────────────────────┬──────────────────────┘               │
│                          │                                        │
│   ┌──────────┐  ┌────────┴───────┐  ┌──────────┐             │
│   │   Auth   │  │   Controllers  │  │ Services  │             │
│   │ Controller│  │                │  │           │             │
│   └──────────┘  └────────┬───────┘  └─────┬─────┘             │
│                          │                  │                    │
│                    ┌─────┴──────┐    ┌─────┴─────┐             │
│                    │  Leaderboard │    │   Score   │             │
│                    │   Service    │    │  Service  │             │
│                    └──────┬──────┘    └─────┬─────┘             │
│                           │                  │                    │
└───────────────────────────┼──────────────────┼────────────────────┘
                            │                  │
                     ┌──────┴──────────────────┴──────┐
                     │      PostgreSQL Database        │
                     │  ┌────────┐  ┌─────────────┐  │
                     │  │ Scores │  │ Leaderboard  │  │
                     │  └────────┘  └─────────────┘  │
                     │  ┌────────┐  ┌─────────────┐  │
                     │  │  Users │  │   Lessons    │  │
                     │  └────────┘  └─────────────┘  │
                     └─────────────────────────────────┘
```

## License

This project is part of a capstone/academic project.

## Acknowledgments

- **Spring Boot** - Backend framework
- **React** - Frontend library
- **Material UI** - Component library
- **PostgreSQL** - Database
- Inspired by typing platforms like **Keybr** and **Typing.com**

---

*Last updated: 2026-03-25*
