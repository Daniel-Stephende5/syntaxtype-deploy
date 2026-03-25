# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- Java 17 - Backend API and business logic
- JavaScript (ES6+) - Frontend React application
- TypeScript - Not used (plain JavaScript with JSDoc)

**Secondary:**
- CSS with Tailwind CSS - Styling framework

## Runtime

**Backend:**
- OpenJDK 17 (eclipse-temurin)
- Spring Boot 3.4.4

**Frontend:**
- Node.js (for build tooling via react-scripts)
- React 18.2.0

**Package Manager:**
- Maven (backend) - `pom.xml`
- npm (frontend) - `package.json`
- Lockfile: `frontend/package-lock.json` (present)

## Frameworks

**Backend Core:**
- Spring Boot 3.4.4 - Web framework
- Spring Data JPA 3.4.4 - ORM and persistence
- Spring Security 3.4.4 - Authentication and authorization

**Frontend Core:**
- React 18.2.0 - UI library
- React Router DOM 6.14.1 - Client-side routing

**Backend Testing:**
- Spring Boot Test 3.4.4
- Spring Security Test 3.4.4

**Frontend Testing:**
- Testing Library (React) 16.3.0 - Component testing
- jest-dom 6.6.3 - DOM assertions

**Build/Dev Tools:**
- Maven 3.8.6 (for Docker builds) or 3.9.9 (recommended in Dockerfile)
- Create React App 5.0.1 (react-scripts)
- Tailwind CSS 3.x - Utility-first CSS framework
- PostCSS with Autoprefixer - CSS processing

## Key Dependencies

**Backend Critical:**
- `spring-boot-starter-web` - REST API support
- `spring-boot-starter-data-jpa` - Database ORM
- `spring-boot-starter-security` - Security framework
- `springdoc-openapi-starter-webmvc-ui` 2.8.5 - OpenAPI/Swagger documentation
- `postgresql` 42.7.5 - PostgreSQL JDBC driver
- `mysql-connector-j` - MySQL JDBC driver (configured but not actively used)
- `lombok` - Code generation (getters, setters, builders)
- `jjwt-api` / `jjwt-impl` / `jjwt-jackson` 0.12.6 - JWT token handling

**Frontend Critical:**
- `@mui/material` 7.1.1 - Material UI component library
- `@mui/icons-material` 7.1.1 - Material UI icons
- `@emotion/react` / `@emotion/styled` 11.14.0 - CSS-in-JS styling (MUI dependency)
- `axios` 1.9.0 - HTTP client for API calls
- `@hello-pangea/dnd` 18.0.1 - Drag and drop library
- `@tinymce/tinymce-react` 6.3.0 - Rich text editor
- `jwt-decode` 4.0.0 - JWT token decoding
- `dompurify` 3.3.0 - DOM sanitization
- `web-vitals` 2.1.4 - Performance metrics

**Frontend Dev:**
- `http-proxy-middleware` 2.0.6 - Development API proxy

## Configuration

**Backend Spring Configuration:**
- `backend/src/main/resources/application.properties`
- Configured for PostgreSQL database
- HikariCP connection pooling (max: 10, min: 2, idle: 600s)
- JWT secret configured via `jwt.secret` property
- Admin user defaults (username: admin, email: admin@gmail.com)

**Frontend Build Configuration:**
- `frontend/package.json` - npm scripts and dependencies
- `frontend/src/tailwind.config.js` - Tailwind CSS configuration
- `frontend/src/postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `frontend/src/setupProxy.js` - Development proxy to backend

**Environment:**
- Backend: Render.com hosting (port 8080, `PORT` env var)
- Frontend: Vercel hosting (syntaxtype-deploy-omega.vercel.app)
- CORS configured for Vercel domain and localhost (3000, 5173)

## Platform Requirements

**Development:**
- Java 17+
- Node.js (for frontend)
- PostgreSQL database (local or Docker)

**Production:**
- Render.com - Backend deployment with Docker
- Vercel - Frontend static deployment
- PostgreSQL - Render managed database (dpg-d6pbg4hj16oc7390l0p0-a)

---

*Stack analysis: 2026-03-25*
