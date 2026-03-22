# Technology Stack

**Analysis Date:** 2026-03-14

## Languages

**Primary:**
- Java 17 - Backend API and business logic

**Secondary:**
- JavaScript (ES6+) - Frontend React application

## Runtime

**Backend Environment:**
- Java 17 (eclipse-temurin-17)
- Maven 3.8.6 for build management

**Frontend Environment:**
- Node.js (managed via react-scripts/CRA)
- npm 11.6.2

**Package Manager:**
- Maven (backend) - pom.xml
- npm (frontend) - package.json

## Frameworks

**Backend (Spring Boot):**
- Spring Boot 3.4.4 - Core framework
- Spring Security - Authentication and authorization
- Spring Data JPA - Database ORM
- Spring Web - REST API

**Frontend (React):**
- React 18.2.0 - UI library
- React Router DOM 6.14.1 - Client-side routing

**Testing:**
- Spring Boot Starter Test - Backend unit testing
- Testing Library (React) - Frontend component testing

**Build/Dev:**
- Maven - Backend build tool
- react-scripts 5.0.1 - Frontend build tool (Create React App)
- http-proxy-middleware - Frontend dev proxy

## Key Dependencies

**Backend Critical:**
- Spring Boot Starter Web 3.4.4 - REST API support
- Spring Boot Starter Security 3.4.4 - Security framework
- Spring Boot Starter Data JPA 3.4.4 - ORM support
- jjwt 0.12.6 - JWT token handling (JJWT library)
- PostgreSQL Driver 42.7.5 - Database connectivity
- MySQL Connector - Alternative database support
- Lombok - Annotation processing for boilerplate reduction
- springdoc-openapi 2.8.5 - API documentation (Swagger)

**Frontend Critical:**
- React 18.2.0 - Core UI framework
- React Router DOM 6.14.1 - Routing
- Axios 1.9.0 - HTTP client
- MUI (Material UI) 7.1.1 - UI component library
- @emotion/react 11.14.0 - CSS-in-JS styling
- @hello-pangea/dnd 18.0.1 - Drag and drop
- @tinymce/tinymce-react 6.3.0 - Rich text editor
- jwt-decode 4.0.0 - JWT token decoding
- dompurify 3.3.0 - HTML sanitization

## Database

**Primary Database:**
- PostgreSQL (hosted on Render - dpg-d6pbg4hj16oc7390l0p0-a)
- Database: syntaxtype_1iqw
- Connection via JDBC with Hibernate ORM
- HikariCP connection pooling

**Alternative Support:**
- MySQL connector available for local development

## Configuration

**Environment:**
- application.properties - Main configuration
- Environment variables for production (Render platform)
- JWT secret configured in properties

**Key Configurations:**
- Port: 8080 (configurable via PORT env var)
- CORS enabled for frontend domain
- HikariCP pool tuning for production

## Platform Requirements

**Development:**
- Local PostgreSQL or MySQL for development
- Node.js for frontend development server

**Production:**
- Backend: Render (PaaS) with Docker
- Frontend: Vercel (frontend is deployed to syntaxtype-deploy-omega.vercel.app)
- Database: Render PostgreSQL

---

*Stack analysis: 2026-03-14*
