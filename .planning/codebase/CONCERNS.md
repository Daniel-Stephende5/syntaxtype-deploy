# Codebase Concerns

**Analysis Date:** 2026-03-14

## Critical Security Issues

### Hardcoded Credentials in Source Code

**Issue:** Database credentials, JWT secrets, and admin credentials are hardcoded in `application.properties`.

**Files:**
- `backend/src/main/resources/application.properties`

**Details:**
- Line 19-21: Database URL, username, and password exposed:
  ```
  spring.datasource.url=jdbc:postgresql://dpg-d6pbg4hj16oc7390l0p0-a:5432/syntaxtype_1iqw
  spring.datasource.username=syntaxtype_1iqw_user
  spring.datasource.password=TQy3eXhqMznlL4CphjFCtIUotT3wKMqH
  ```
- Line 54: JWT secret hardcoded: `jwt.secret=YourSuperSecretKeyThatIsAtLeast256BitsLongAndRandom`
- Line 57-59: Admin credentials: `admin.username=admin`, `admin.email=admin@gmail.com`, `admin.password=admin123`

**Impact:** Anyone with access to the source code can access the production database and manipulate authentication. The current admin password is extremely weak ("admin123").

**Fix approach:** Move all secrets to environment variables or a secrets manager. Use `${ENV_VAR:default}` pattern for local development.

---

### Authentication Completely Disabled

**Issue:** JWT authentication filter is commented out and all API endpoints are permitAll.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/SecurityConfig.java`

**Details:**
- Line 54: `.requestMatchers("/api/**").permitAll()` - All API endpoints are publicly accessible
- Line 57: JWT filter is commented out: `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);`

**Impact:** No authentication required to access any API endpoint. Anyone can access, modify, or delete any data.

**Fix approach:** Uncomment the JWT filter and implement proper role-based access control. Change `.permitAll()` to `.authenticated()` for API endpoints.

---

### Duplicate Database Dependencies

**Issue:** PostgreSQL dependency is declared twice in pom.xml with different versions.

**Files:**
- `backend/pom.xml`

**Details:**
- Line 57-61: postgresql with `runtime` scope
- Line 62-66: postgresql with explicit version `42.7.5`

**Impact:** Version conflicts and unpredictable behavior.

**Fix approach:** Remove the duplicate dependency and keep only one with explicit version.

---

## Error Handling Issues

### Global Exception Handlers Disabled

**Issue:** Both GlobalExceptionHandler and RestExceptionHandler are completely commented out.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/syntaxtype/demo/Exception/RestExceptionHandler.java`

**Details:**
- All exception handlers in both files are commented out
- No centralized error response format
- Raw exception messages could leak to clients

**Impact:** Inconsistent error responses, potential information disclosure, difficult debugging.

**Fix approach:** Uncomment and customize exception handlers to provide consistent error responses.

---

### Services Return null Instead of Throwing Exceptions

**Issue:** All service classes return `null` for non-existent entities instead of throwing appropriate exceptions.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Service/users/UserService.java` (lines 112, 122)
- `backend/src/main/java/com/syntaxtype/demo/Service/users/AdminService.java` (lines 66, 77)
- `backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java` (lines 80, 91, 102, 113)
- `backend/src/main/java/com/syntaxtype/demo/Service/users/StudentService.java` (lines 97, 108, 119, 130, 141, 152, 163)
- `backend/src/main/java/com/syntaxtype/demo/Service/statistics/UserStatisticsService.java` (lines 89, 100, 111, 122, 133, 144, 155, 166)
- And similar patterns in all other service classes

**Impact:**
- NullPointerExceptions in calling code
- Silent failures - callers don't know if resource wasn't found vs. other errors
- Inconsistent with REST best practices (should return 404 for not found)

**Fix approach:** Replace `return null` with `throw new EntityNotFoundException("Entity not found with ID: " + id)` or similar.

---

### Inconsistent Error Handling in findByEmail

**Issue:** UserService.findByEmail() returns null while other find methods return Optional.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Service/users/UserService.java` (line 56)

**Impact:** Calling code must check for null instead of using Optional pattern.

**Fix approach:** Return `Optional<User>` instead of `User` to be consistent with other methods.

---

## Incomplete/Missing Code

### Stub Method Returning Empty DTO

**Issue:** getStatisticsForUserAndLesson returns an empty DTO instead of actual data.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Service/statistics/UserStatisticsService.java` (lines 201-204)

**Details:**
```java
public UserStatisticsDTO getStatisticsForUserAndLesson(Long userId, Long lessonId) {
    // TODO: Implement actual logic to fetch statistics
    return new UserStatisticsDTO(); // Return dummy or real data as needed
}
```

**Impact:** Frontend receives empty/invalid statistics data.

**Fix approach:** Implement the actual query logic to fetch statistics.

---

## Code Quality Issues

### Code Duplication in Service Update Methods

**Issue:** Multiple nearly-identical update methods in services that could be refactored.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Service/statistics/UserStatisticsService.java` (lines 82-167)

**Details:** Eight update methods (updateUser, updateWordsPerMinute, updateAccuracy, etc.) all follow identical pattern:
1. Find by ID
2. Check if present
3. Set field
4. Save and return

**Impact:** Maintenance burden, potential for inconsistent behavior.

**Fix approach:** Create a generic update method that accepts field name and value, or use a MapStruct mapper.

---

### Inconsistent Naming for isTempPassword

**Issue:** Field naming inconsistency between Java property and database column.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Entity/Users/User.java` (lines 44-46)

**Details:**
```java
@Column(name = "hasTemporaryPass")
@Builder.Default
private boolean isTempPassword = false;
```

**Impact:** Confusion and potential for bugs.

**Fix approach:** Use consistent naming - either `isTempPassword` for both or rename the column to match.

---

### Debug Logging Enabled in Production

**Issue:** Verbose debug logging is enabled.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/SecurityConfig.java` (line 60)
- `backend/src/main/resources/application.properties` (lines 11-13, 60)

**Details:**
```properties
logging.level.org.apache.catalina=DEBUG
logging.level.org.springframework.web.filter=DEBUG
logging.level.backend=DEBUG
logging.level.org.springframework.security=DEBUG
```

**Impact:** Performance degradation, log bloat, potential information disclosure.

**Fix approach:** Use INFO or WARN level for production. DEBUG should only be enabled temporarily for troubleshooting.

---

## Frontend Issues

### Deprecated Dependencies

**Issue:** Using deprecated react-scripts (Create React App).

**Files:**
- `frontend/package.json` (line 24)

**Details:**
```json
"react-scripts": "^5.0.1"
```

**Impact:** No security updates, larger bundle sizes, slower builds.

**Fix approach:** Migrate to Vite or Next.js.

---

### Incorrect Dependencies

**Issue:** NPM-related packages in production dependencies.

**Files:**
- `frontend/package.json` (lines 18, 20)

**Details:**
```json
"i": "^0.3.7",
"npm": "^11.6.2",
```

**Impact:** Unnecessary bundle size, potential version conflicts.

**Fix approach:** Remove these packages - they're development tools, not production dependencies.

---

### TODO in Frontend Code

**Issue:** Incomplete feature - score display not implemented.

**Files:**
- `frontend/src/pages/GalaxyGame/GalaxyChallengeList.js` (line 80)

**Details:**
```javascript
<button style={{ marginLeft: 12 }} onClick={() => { /* TODO: show score */ }}>
```

**Impact:** Users cannot view their scores.

**Fix approach:** Implement the score display functionality.

---

## Architectural Concerns

### CORS Configuration Hardcoded

**Issue:** Frontend URLs are hardcoded in multiple places.

**Files:**
- `backend/src/main/resources/application.properties` (line 67)
- `backend/src/main/java/com/syntaxtype/demo/Controller/auth/security/SecurityConfig.java` (line 78)

**Impact:** Difficult to maintain, potential for production issues when adding new environments.

**Fix approach:** Use environment variables consistently for all frontend URLs.

---

### Method Security Not Functional

**Issue:** @PreAuthorize annotations exist but are not enforced due to disabled authentication.

**Files:**
- `backend/src/main/java/com/syntaxtype/demo/Controller/users/AdminController.java`
- `backend/src/main/java/com/syntaxtype/demo/Controller/users/TeacherController.java`
- And other controllers

**Details:** Controllers use `@PreAuthorize("hasRole('ADMIN')")` but since authentication is disabled, these checks never execute.

**Impact:** Even if authentication is enabled, role checks may not work without proper JWT filter configuration.

**Fix approach:** Enable JWT authentication filter and verify role-based access works correctly.

---

## Summary of Priority Issues

| Priority | Issue | Impact |
|----------|-------|--------|
| CRITICAL | Hardcoded credentials | Security breach risk |
| CRITICAL | Authentication disabled | Complete data exposure |
| HIGH | Exception handlers disabled | Poor error handling |
| HIGH | Services return null | Runtime errors |
| MEDIUM | Debug logging in production | Performance issues |
| MEDIUM | Deprecated frontend build | Security/maintenance |
| LOW | Code duplication | Maintainability |

---

*Concerns audit: 2026-03-14*
