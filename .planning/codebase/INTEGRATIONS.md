# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Code Execution:**
- Judge0 CE (RapidAPI) - Online code compiler/executor
  - Endpoint: `https://judge0-ce.p.rapidapi.com/submissions`
  - Used in: `frontend/src/pages/judge0.js`
  - Purpose: Execute C code submissions in Galaxy Challenge game
  - Authentication: RapidAPI key (x-rapidapi-key header)

**Database:**
- PostgreSQL (Render Managed) - Primary relational database
  - Host: `dpg-d6pbg4hj16oc7390l0p0-a`
  - Port: 5432
  - Database: `syntaxtype_1iqw`
  - Username: `syntaxtype_1iqw_user`
  - ORM: Spring Data JPA with Hibernate
  - Dialect: PostgreSQLDialect

**File Storage:**
- Not detected - No cloud storage service (S3, Cloudinary, etc.)
- File uploads handled locally or not implemented

**Caching:**
- Not detected - No Redis or in-memory cache service

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Implementation: `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/`
  - Library: jjwt 0.12.6
  - Token Expiry: 24 hours (86400000ms)
  - Claims: username, role, id, isTempPassword

**Key Components:**
- `JwtUtil.java` - Token generation, validation, claims extraction
- `JwtAuthFilter.java` - Request filter for JWT validation
- `CustomUserDetailsService.java` - User authentication service
- `SecurityConfig.java` - Spring Security configuration

**User Roles:**
- ADMIN - Full system access
- TEACHER - Can create/edit lessons and challenges
- STUDENT - Can take lessons, play games, submit code
- USER - Basic role (extends Student in entities)

**Password Encoding:**
- BCryptPasswordEncoder - Spring Security built-in

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, Bugsnag, or similar service

**Logs:**
- Spring Boot logging with DEBUG level
- Configured in `application.properties`:
  - `logging.level.org.apache.catalina=DEBUG`
  - `logging.level.org.springframework.web.filter=DEBUG`
  - `logging.level.backend=DEBUG`
  - `logging.level.org.springframework.security=DEBUG`

**API Documentation:**
- Swagger/OpenAPI - springdoc-openapi-starter-webmvc-ui 2.8.5
  - Endpoint: `/swagger-ui.html` (when running locally)
  - OpenAPI spec: `/v3/api-docs`

## CI/CD & Deployment

**Backend Hosting:**
- Render.com
  - Deployment: Docker container
  - Port: 8080 (via `PORT` env var)
  - Dockerfile: `backend/Dockerfile`
  - Multi-stage build with Maven and Eclipse Temurin JRE 17

**Frontend Hosting:**
- Vercel
  - URL: `https://syntaxtype-deploy-omega.vercel.app`
  - Static React application
  - Build command: `npm run build`
  - Output directory: `build/`

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or similar

## Environment Configuration

**Required env vars (Backend):**
- `PORT` - Server port (default: 8080)
- `FRONTEND_URL` - Allowed CORS origin (vercel.app URL)
- `jwt.secret` - JWT signing key (at least 256 bits)
- `spring.datasource.url` - PostgreSQL connection URL
- `spring.datasource.username` - Database username
- `spring.datasource.password` - Database password

**Required env vars (Frontend):**
- `REACT_APP_API_BASE_URL` - Backend API base URL
- `REACT_APP_BACKEND_URL` - Backend URL for dev proxy (localhost:8080)

**Secrets location:**
- Render.com - Environment variables for backend
- Vercel - Environment variables for frontend

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints

**Outgoing:**
- Judge0 RapidAPI - Code execution requests

## Cross-Origin Configuration

**Allowed Origins:**
- `http://localhost:3000` - React dev server (Create React App)
- `http://localhost:5173` - Vite dev server (alternative)
- `https://syntaxtype-deploy-omega.vercel.app/` - Production frontend

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Exposed Headers:**
- Authorization (for JWT tokens)

## Third-Party UI Resources

**Material Design:**
- MUI (Material UI) 7.1.1 - Component library
- MUI Icons 7.1.1 - Icon set

**Rich Text Editing:**
- TinyMCE 6.3.0 - For lesson content editing
- Package: `@tinymce/tinymce-react`

**Styling:**
- Tailwind CSS 3.x - Utility-first CSS
- Emotion - CSS-in-JS (MUI dependency)

---

*Integration audit: 2026-03-25*
