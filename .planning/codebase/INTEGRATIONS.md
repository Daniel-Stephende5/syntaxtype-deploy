# External Integrations

**Analysis Date:** 2026-03-14

## APIs & External Services

**Code Execution:**
- Judge0 CE (RapidAPI) - Online code compiler/executor
  - Used in: `frontend/src/pages/judge0.js`
  - Purpose: Execute C code for code challenges
  - Endpoint: https://judge0-ce.p.rapidapi.com/submissions
  - Authentication: RapidAPI key via header
  - RapidAPI Key: Hardcoded in frontend (security concern)

## Data Storage

**Databases:**
- PostgreSQL (Primary)
  - Provider: Render (cloud hosting)
  - Connection: JDBC URL in application.properties
  - Credentials: Environment variables on Render
  - ORM: Hibernate with Spring Data JPA

**No File Storage:**
- Local filesystem only for static assets
- No cloud storage integration detected

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Implementation: Spring Security with JWT tokens
  - Token Library: io.jsonwebtoken (JJWT) 0.12.6
  - Files: `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/`
  - Filter: JwtAuthFilter.java
  - Utility: JwtUtil.java

**User Roles:**
- Student - Standard learner role
- Teacher - Instructor role
- Admin - Administrative role
- User - Base user entity

**Credentials Storage:**
- Passwords stored with JWT secret
- JWT tokens stored on client-side
- Session via localStorage in frontend

## Real-Time Features

**Not detected:**
- No WebSocket implementation
- No Server-Sent Events
- No real-time push notifications
- Polling-based updates if needed

## File Handling

**Static Resources:**
- Frontend: React static build served by Vercel
- Backend: Swagger/OpenAPI docs at /swagger-ui.html
- No explicit file upload functionality detected

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, Rollbar, or similar

**Logs:**
- Spring Boot logging via SLF4J
- Configured logging levels in application.properties
- Log levels: DEBUG for catalina, web filters, backend

**Health Checks:**
- HealthController.java - Endpoint for health monitoring
- Render platform health monitoring

## CI/CD & Deployment

**Backend Hosting:**
- Render (PaaS)
  - Dockerfile: Multi-stage build
  - Base image: maven:3.8.6-eclipse-temurin-17 (build), eclipse-temurin:17-jre (runtime)
  - Exposed port: 8080
  - Configurable via PORT environment variable

**Frontend Hosting:**
- Vercel
  - URL: syntaxtype-deploy-omega.vercel.app
  - Connected to frontend codebase

**CI/CD:**
- Not detected - Manual deployments or simple platform auto-deploy

## Environment Configuration

**Required env vars (Backend):**
- PORT - Server port (Render sets this)
- DB_HOST - Database host
- DB_PORT - Database port
- DB_NAME - Database name
- DB_USERNAME - Database username
- DB_PASSWORD - Database password

**Required env vars (Frontend):**
- REACT_APP_API_BASE_URL - Backend API base URL
- (Optional) - Can fall back to relative paths via proxy

**Secrets location:**
- Hardcoded JWT secret in application.properties (security concern)
- Database credentials in Render environment variables
- RapidAPI key hardcoded in frontend code

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Cross-Origin Configuration

**CORS:**
- Frontend URL configured: syntaxtype-deploy-omega.vercel.app
- CorsConfig.java in backend security package
- Development proxy via http-proxy-middleware

---

*Integration audit: 2026-03-14*
