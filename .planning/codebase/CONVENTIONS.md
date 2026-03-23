# Coding Conventions

**Analysis Date:** 2026-03-14

## Overview

This codebase is a Spring Boot + React application with a clear layered architecture. The frontend uses React 18 with Material-UI, and the backend uses Spring Boot 3.4.4 with Java 17.

---

## Frontend Conventions (React)

### Naming Patterns

**Files:**
- Components: PascalCase (e.g., `LoginPage.js`, `ProtectedRoute.js`, `Navbar.js`)
- Utilities: PascalCase (e.g., `AuthUtils.js`, `JwtUtils.js`, `api.js`)
- CSS files: Same name as component with `.css` extension (e.g., `GridGame.css`)

**Functions:**
- React components: PascalCase (e.g., `const LoginPage = () => {...}`)
- Helper functions: camelCase (e.g., `handleSubmit`, `validateForm`, `resolveApi`)

**Variables:**
- camelCase (e.g., `email`, `password`, `userId`, `authStatus`)
- State hooks: `const [state, setState] = useState(...)`
- Boolean flags: `is` prefix (e.g., `isLoggedIn`, `isTempPassword`, `isAuthenticated`)

**Constants:**
- UPPER_SNAKE_CASE for env-based constants (e.g., `API_BASE`)

### Code Style

**Formatting:**
- No explicit formatter configured (no Prettier or ESLint config found)
- Uses 4-space indentation
- Uses single quotes for strings in JS

**Styling:**
- Material-UI (MUI) v7 for components
- Tailwind CSS for custom styling (configured in `frontend/src/tailwind.config.js`)
- MUI `sx` prop for inline styles
- CSS files for complex component-specific styles

### Import Organization

**Order in React files:**
1. React imports (`import React from 'react'`)
2. Third-party libraries (`import { Link, useNavigate } from 'react-router-dom'`)
3. Custom utilities (`import { setAuthToken } from '../utils/AuthUtils'`)
4. Custom components (`import Navbar from './components/Navbar'`)
5. Page components (`import LoginPage from './pages/LoginPage'`)

**Path aliases:** None configured - uses relative paths (`../`, `./`)

### Component Patterns

**Function Components:**
```javascript
const ComponentName = () => {
    // State hooks
    const [state, setState] = useState(initialValue);
    
    // Effects
    useEffect(() => {
        // side effects
        return () => cleanup; // cleanup function
    }, [dependencies]);
    
    // Handlers
    const handleEvent = async (event) => {
        // async operations with try/catch
    };
    
    // Render
    return (
        <JSX />
    );
};

export default ComponentName;
```

**Page Components Location:** `frontend/src/pages/`
- Examples: `LoginPage.js`, `RegisterPage.js`, `TypingTest.js`, `Dashboard.js`

**Route Configuration:**
- Uses React Router v6 with `Routes` and `Route`
- Protected routes wrapped with `ProtectedRoute` component
- Role-based access control via `allowedRoles` prop

### State Management

- React hooks (`useState`, `useEffect`) for local state
- Session storage for auth tokens (`sessionStorage.setItem('token', token)`)
- JWT tokens decoded client-side using `jwt-decode`

### Error Handling

- Try/catch blocks for async operations
- Error state managed via React state
- User-friendly error messages displayed via MUI `Alert` component

---

## Backend Conventions (Spring Boot)

### Naming Patterns

**Packages:**
- Lowercase with dots (e.g., `com.syntaxtype.demo.Service.users`)
- Organized by layer: `Controller`, `Service`, `Repository`, `Entity`, `DTO`, `Exception`

**Java Classes:**
- PascalCase (e.g., `UserController.java`, `UserService.java`, `User.java`)
- Interfaces end with `Repository`, `Service` suffix
- Controllers end with `Controller` suffix

**Methods:**
- camelCase (e.g., `findAll()`, `saveUserWithAdminRole()`, `convertToDTO()`)

### Code Style

**Annotations:**
- Lombok used to reduce boilerplate (`@Getter`, `@Setter`, `@Builder`, `@AllArgsConstructor`, `@NoArgsConstructor`, `@RequiredArgsConstructor`)
- Spring annotations for DI (`@Service`, `@RestController`, `@Repository`)
- JPA annotations (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`)

**Entity Patterns:**
```java
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "table_name")
@Builder
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NonNull
    @Column(unique = true)
    private String field;
    
    @PrePersist
    protected void onCreate() {
        // lifecycle hooks
    }
}
```

### Layer Structure

**Controller Layer:** `backend/src/main/java/com/syntaxtype/demo/Controller/`
- REST endpoints with `@RestController`
- Request mapping with `@RequestMapping`, `@GetMapping`, `@PostMapping`, etc.
- Authorization with `@PreAuthorize("hasAnyRole('ADMIN')")`

**Service Layer:** `backend/src/main/java/com/syntaxtype/demo/Service/`
- Business logic in `@Service` classes
- Uses `@RequiredArgsConstructor` for constructor injection
- DTO conversion methods (`convertToDTO`, `convertFromDTO`)

**Repository Layer:** `backend/src/main/java/com/syntaxtype/demo/Repository/`
- Spring Data JPA interfaces extending `JpaRepository`
- Query methods following Spring Data naming conventions

**Entity Layer:** `backend/src/main/java/com/syntaxtype/demo/Entity/`
- JPA entities with Lombok annotations
- Enums in `Entity/Enums/`
- Composite keys in `Entity/CompositeKeys/`
- Junction tables in `Entity/Junctions/`

**DTO Layer:** `backend/src/main/java/com/syntaxtype/demo/DTO/`
- Data transfer objects using Lombok `@Builder`
- Organized by feature (e.g., `DTO/users/`, `DTO/lessons/`)

### Import Organization

**Order in Java files:**
1. Package declaration
2. External imports (Spring, JPA, Lombok)
3. Internal imports (own package)

---

## Database

**ORM:** Spring Data JPA with Hibernate

**Databases Supported:**
- MySQL (`mysql-connector-j`)
- PostgreSQL (`postgresql`)

---

## API Design

**RESTful conventions:**
- `/api/users` for user endpoints
- Role-based sub-resources (e.g., `/api/users/role/{role}`)
- HTTP verbs: GET (read), POST (create), PATCH (partial update), PUT (update), DELETE (remove)

**Authentication:**
- JWT-based authentication
- Token stored in session storage on frontend
- Bearer token in Authorization header

---

## Configuration

**Backend:**
- Spring Boot configuration via `application.properties` or YAML
- Externalized admin credentials via `@Value` annotations

**Frontend:**
- Environment variables via `.env` file
- `REACT_APP_API_BASE_URL` for API base URL

---

## Build Tools

**Frontend:**
- `react-scripts` (Create React App)
- npm for package management

**Backend:**
- Maven (`pom.xml`)
- Spring Boot Maven Plugin

---

*Convention analysis: 2026-03-14*
