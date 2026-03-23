# Testing Patterns

**Analysis Date:** 2026-03-14

## Test Framework Overview

### Frontend (React)

**Test Runner:** Jest (via `react-scripts`)

**Testing Libraries:**
- `@testing-library/react` v16.3.0 - React component testing
- `@testing-library/jest-dom` v6.6.3 - Custom Jest matchers for DOM
- `@testing-library/user-event` v13.5.0 - Simulate user interactions
- `@testing-library/dom` v10.4.0 - DOM testing utilities

**Test Commands:**
```bash
npm test                  # Run tests in watch mode
npm test -- --coverage   # Run tests with coverage
npm test -- --watchAll=false  # Run all tests once
```

**Configuration:** `frontend/src/setupTests.js`
```javascript
import '@testing-library/jest-dom';
```

### Backend (Spring Boot)

**Test Runner:** JUnit 5 (via Spring Boot Starter Test)

**Testing Dependencies (from pom.xml):**
- `spring-boot-starter-test` - Includes JUnit, Mockito, AssertJ
- `spring-security-test` - Security testing support

**Test Commands:**
```bash
mvn test                    # Run all tests
mvn test -Dtest=ClassName  # Run specific test class
mvn verify                  # Run tests and verify
```

---

## Test File Organization

### Frontend

**Location:** Tests are co-located with source files
- Test file: `frontend/src/App.test.js`
- Source file: `frontend/src/App.js`

**Naming Convention:**
- `{ComponentName}.test.js` or `{ComponentName}.test.jsx`
- `{ComponentName}.spec.js` or `{ComponentName}.spec.jsx`

**Existing Tests:**
- `frontend/src/App.test.js` - Basic React app smoke test

### Backend

**Location:** `backend/src/test/java/com/syntaxtype/demo/`

**Naming Convention:**
- `{ClassName}Tests.java` for integration tests
- `{ClassName}Test.java` for unit tests

**Existing Tests:**
- `backend/src/test/java/com/syntaxtype/demo/DemoApplicationTests.java` - Spring context load test

---

## Test Structure

### Frontend Test Pattern

```javascript
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

test('description of what is being tested', () => {
  render(<ComponentName />);
  const element = screen.getByText(/expected text/i);
  expect(element).toBeInTheDocument();
});
```

**Example from `frontend/src/App.test.js`:**
```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

### Backend Test Pattern

```java
package com.syntaxtype.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ClassNameTests {

    @Test
    void contextLoads() {
    }
}
```

**Example from `backend/src/test/java/com/syntaxtype/demo/DemoApplicationTests.java`:**
```java
package com.syntaxtype.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

---

## Test Types

### Frontend

**Unit Tests:**
- Test individual React components in isolation
- Use `@testing-library/react` for rendering
- Mock API calls with `jest.mock()` if needed

**Component Tests:**
- Test component rendering and user interactions
- Use `@testing-library/user-event` for simulating clicks, typing

**Smoke Tests:**
- Basic tests to ensure app renders without crashing

### Backend

**Integration Tests:**
- `@SpringBootTest` loads full application context
- Tests with `@MockBean` for external dependencies
- Uses test security with `@WithMockUser`

**Context Load Tests:**
- Verify Spring context starts successfully
- Minimal test to catch configuration issues

---

## Mocking

### Frontend

**Jest Mocks:**
```javascript
jest.mock('axios');
jest.mock('../utils/AuthUtils', () => ({
    getAuthToken: () => 'mock-token',
    setAuthToken: jest.fn()
}));
```

**Testing Library Matchers (from jest-dom):**
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toHaveValue()`
- `toBeDisabled()`
- `toHaveClass()`

### Backend

**Mockito (via Spring Boot Test):**
- `@MockBean` for mocking repositories in tests
- `Mockito.when()` for stubbing method calls
- `Mockito.verify()` for interaction testing

---

## Coverage

### Frontend

**Coverage Report:**
```bash
npm test -- --coverage
```

**Coverage thresholds:** Not enforced (no configuration found)

**Typical coverage areas:**
- Component rendering
- User interaction handlers
- Conditional rendering logic

### Backend

**Coverage:** Not currently enforced

**Test scope:**
- Service layer logic
- Controller endpoints (integration)
- Repository queries (via integration tests)

---

## Test Utilities

### Frontend

**API Mocking:**
- Uses development proxy (`frontend/src/setupProxy.js`)
- Can mock with MSW (not currently configured)

**Auth Testing:**
- Mock JWT tokens in session storage
- Test protected routes with `ProtectedRoute` component

### Backend

**Database:**
- Uses main database (MySQL/PostgreSQL)
- Consider `@DataJpaTest` for repository tests with in-memory DB

**Security Testing:**
- `@WithMockUser` for authenticated tests
- CSRF protection handled automatically

---

## Recommendations for Expansion

### Frontend Testing

1. **Add more component tests:**
   - Test `LoginPage.js` form validation
   - Test `ProtectedRoute.js` auth redirects
   - Test `Navbar.js` navigation

2. **Add utility tests:**
   - Test `AuthUtils.js` token handling
   - Test `JwtUtils.js` decoding
   - Test `api.js` URL resolution

3. **Consider adding:**
   - `msw` (Mock Service Worker) for API mocking
   - Snapshot testing for complex components

### Backend Testing

1. **Add service tests:**
   - Test `UserService.java` business logic
   - Test DTO conversions

2. **Add controller tests:**
   - Use `@WebMvcTest` for isolated controller tests
   - Test request/response handling

3. **Add repository tests:**
   - Use `@DataJpaTest` with H2 in-memory database

---

## Running Tests

### Frontend
```bash
# Development - watch mode
npm test

# Single run
npm test -- --watchAll=false

# With coverage
npm test -- --coverage --watchAll=false
```

### Backend
```bash
# All tests
mvn test

# Specific class
mvn test -Dtest=DemoApplicationTests

# Skip tests
mvn clean package -DskipTests
```

---

*Testing analysis: 2026-03-14*
