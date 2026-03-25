# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework Overview

### Backend (Spring Boot)

**Primary Test Framework:** JUnit 5 (Jupiter)

**Dependencies from `pom.xml`:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

**Testing Dependencies Included:**
- JUnit 5 (assertions, conditions, display names, nested tests)
- Mockito (mocking)
- AssertJ (fluent assertions)
- Spring Test (Spring MVC test support)
- Spring Security Test (security testing)

**Libraries Available:**
- Spring Boot Test (includes JUnit, Mockito, AssertJ)
- MockMvc (for controller testing)
- TestEntityManager (for repository testing)
- Lombok (annotation processing)

### Frontend (React)

**Primary Test Framework:** Jest (via Create React App)

**Dependencies from `package.json`:**
```json
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/react": "^16.3.0",
"@testing-library/user-event": "^13.5.0",
"@testing-library/dom": "^10.4.0"
```

**Configuration:**
- ESLint extends: `react-app`, `react-app/jest`
- Default CRA test setup in `frontend/src/setupTests.js`

## Backend Testing Patterns

### Test File Locations

```
backend/src/test/java/com/syntaxtype/demo/
├── DemoApplicationTests.java              # Context load test
├── Controller/
│   └── statistics/
│       └── LeaderboardControllerTest.java
├── Service/
│   └── statistics/
│       └── LeaderboardServiceTest.java
├── Repository/
│   └── statistics/
│       └── LeaderboardRepositoryTest.java
└── DTO/
    └── statistics/
        └── LeaderboardEntryTest.java
```

**Naming Convention:** `{ClassName}Test.java`

### Test Execution Commands

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=LeaderboardControllerTest

# Run with Maven wrapper (if available)
./mvnw test
```

### Controller Testing Pattern

**Framework:** `@WebMvcTest` + MockMvc

**Example from `LeaderboardControllerTest.java`:**
```java
@WebMvcTest(LeaderboardController.class)
@AutoConfigureMockMvc(addFilters = false)  // Disable security filters for testing
class LeaderboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeaderboardService leaderboardService;

    private List<LeaderboardEntry> sampleEntries;

    @BeforeEach
    void setUp() {
        sampleEntries = Arrays.asList(
            LeaderboardEntry.builder()
                .rank(1)
                .username("player1")
                .wpm(120)
                .accuracy(98)
                .score(176.4)
                .gameName("TYPING_TESTS")
                .dateAchieved(LocalDateTime.now())
                .build(),
            // More entries...
        );
    }

    @Nested
    @DisplayName("GET /api/leaderboards/global Tests")
    class GlobalLeaderboardTests {

        @Test
        @DisplayName("Should return global leaderboard with default metric (combined)")
        void shouldReturnGlobalLeaderboardWithDefaultMetric() throws Exception {
            when(leaderboardService.getGlobalTop10("combined"))
                    .thenReturn(sampleEntries);

            mockMvc.perform(get("/api/leaderboards/global")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)))
                    .andExpect(jsonPath("$[0].rank", is(1)))
                    .andExpect(jsonPath("$[0].username", is("player1")));
        }
    }
}
```

**Key Annotations:**
- `@WebMvcTest` - Slice test for controllers
- `@AutoConfigureMockMvc(addFilters = false)` - Disable security filters
- `@MockBean` - Mock Spring beans
- `@Autowired` - Inject MockMvc

**Common Assertions:**
- `status().isOk()`
- `status().isBadRequest()`
- `jsonPath("$", hasSize(n))`
- `jsonPath("$[0].field", is(value))`
- `jsonPath("$[0]", hasKey("fieldName"))`

### Service Testing Pattern

**Framework:** `@ExtendWith(MockitoExtension.class)` + Mockito

**Example from `LeaderboardServiceTest.java`:**
```java
@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private LeaderboardRepository leaderboardRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    private User testUser1;
    private User testUser2;
    private User testUser3;

    @BeforeEach
    void setUp() {
        testUser1 = new User();
        testUser1.setUserId(1L);
        testUser1.setUsername("player1");
        
        // More setup...
    }

    @Nested
    @DisplayName("Combined Score Calculation Tests")
    class CombinedScoreCalculationTests {

        @Test
        @DisplayName("Should calculate combined score with 1.5x multiplier for accuracy > 95")
        void shouldCalculateCombinedScoreWithMultiplier() {
            Double score = LeaderboardEntry.calculateCombinedScore(100, 98);
            assertThat(score).isEqualTo(147.0);
        }
    }
}
```

**Key Annotations:**
- `@ExtendWith(MockitoExtension.class)` - Enable Mockito
- `@Mock` - Mock repository dependency
- `@InjectMocks` - Inject mocks into service

**Assertion Style:** AssertJ fluent assertions
```java
assertThat(result).hasSize(3);
assertThat(result.get(0).getRank()).isEqualTo(1);
assertThat(result).isEmpty();
```

### Repository Testing Pattern

**Framework:** `@DataJpaTest` + `TestEntityManager`

**Example from `LeaderboardRepositoryTest.java`:**
```java
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("LeaderboardRepository Tests")
class LeaderboardRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    private User createAndPersistUser(String username, String email) {
        User user = User.builder()
                .username(username)
                .email(email)
                .password("password123")
                .userRole(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();
        return entityManager.persistFlushFind(user);
    }

    private Leaderboard createAndPersistLeaderboard(User user, Category category, int wpm, int accuracy) {
        Leaderboard leaderboard = Leaderboard.builder()
                .user(user)
                .category(category)
                .wordsPerMinute(wpm)
                .accuracy(accuracy)
                .totalWordsTyped(500)
                .totalTimeSpent(3600)
                .build();
        return entityManager.persistFlushFind(leaderboard);
    }

    @Test
    @DisplayName("Should find top 10 by WPM for a category")
    void shouldFindTop10ByWpmForCategory() {
        User user1 = createAndPersistUser("user1", "user1@test.com");
        // Create more users and leaderboard entries...
        
        List<Leaderboard> results = leaderboardRepository
                .findTop10ByCategoryOrderByWordsPerMinuteDesc(Category.TYPING_TESTS);

        assertEquals(3, results.size());
        assertEquals(120, results.get(0).getWordsPerMinute());
    }
}
```

**Key Annotations:**
- `@DataJpaTest` - Slice test for JPA repositories
- `@ActiveProfiles("test")` - Use test profile
- `@Autowired TestEntityManager` - Programmatic entity management

**Key Methods:**
- `entityManager.persistFlushFind(entity)` - Persist and return managed entity
- Standard JUnit assertions: `assertEquals()`, `assertTrue()`, `assertFalse()`

### DTO/Unit Testing Pattern

**Framework:** JUnit 5 (plain unit tests, no Spring context)

**Example from `LeaderboardEntryTest.java`:**
```java
class LeaderboardEntryTest {

    @Nested
    @DisplayName("calculateCombinedScore tests")
    class CalculateCombinedScoreTests {

        @Test
        @DisplayName("Should calculate basic combined score")
        void shouldCalculateBasicCombinedScore() {
            // WPM: 100, Accuracy: 80%
            // Base: 100 * (80 / 100.0) = 80.0
            Double score = LeaderboardEntry.calculateCombinedScore(100, 80);
            assertEquals(80.0, score);
        }

        @Test
        @DisplayName("Should apply 1.5 multiplier for accuracy > 95")
        void shouldApplyMultiplierForHighAccuracy() {
            // WPM: 100, Accuracy: 98%
            // Base: 100 * (98 / 100.0) = 98.0
            // With multiplier: 98.0 * 1.5 = 147.0
            Double score = LeaderboardEntry.calculateCombinedScore(100, 98);
            assertEquals(147.0, score);
        }
    }

    @Nested
    @DisplayName("Builder pattern tests")
    class BuilderTests {

        @Test
        @DisplayName("Should build LeaderboardEntry with all fields")
        void shouldBuildLeaderboardEntryWithAllFields() {
            LocalDateTime date = LocalDateTime.of(2024, 3, 15, 10, 30);
            
            LeaderboardEntry entry = LeaderboardEntry.builder()
                    .rank(5)
                    .username("builderuser")
                    .score(125.50)
                    .wpm(85)
                    .accuracy(96)
                    .gameName("CHALLENGES")
                    .dateAchieved(date)
                    .build();

            assertEquals(5, entry.getRank());
            assertEquals("builderuser", entry.getUsername());
        }
    }
}
```

### Application Context Test

**Example from `DemoApplicationTests.java`:**
```java
@SpringBootTest
class DemoApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context loads successfully
    }
}
```

## Frontend Testing Patterns

### Test File Locations

```
frontend/src/
├── App.test.js               # Main app test
├── setupTests.js             # Jest setup with jest-dom
└── pages/                    # Page components (no test files found)
    ├── LoginPage.js
    └── LeaderboardPage.js
```

**Naming Convention:** `{ComponentName}.test.js`

### Test Execution Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode (no watch mode)
CI=true npm test
```

### Frontend Test Example

**From `App.test.js`:**
```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

### Frontend Test Setup

**From `setupTests.js`:**
```javascript
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
```

**Available Matchers (via jest-dom):**
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveValue()`
- And many more...

### ESLint Configuration

**From `package.json`:**
```json
"eslintConfig": {
  "extends": [
    "react-app",
    "react-app/jest"
  ]
}
```

## Test Organization Patterns

### JUnit 5 @Nested Classes

**Pattern Used:** Nested inner classes for test organization

```java
@Nested
@DisplayName("GET /api/leaderboards/global Tests")
class GlobalLeaderboardTests {

    @Test
    @DisplayName("Should return global leaderboard with default metric")
    void shouldReturnGlobalLeaderboardWithDefaultMetric() {
        // Test implementation
    }
}

@Nested
@DisplayName("GET /api/leaderboards/game/{category} Tests")
class GameLeaderboardTests {
    // Related tests grouped here
}
```

**Benefits:**
- Logical grouping of related tests
- Descriptive display names
- Shared setup at class level

### Test Data Setup Patterns

**Builder Pattern for Test Data:**
```java
LeaderboardEntry.builder()
    .rank(1)
    .username("player1")
    .wpm(120)
    .accuracy(98)
    .score(176.4)
    .gameName("TYPING_TESTS")
    .dateAchieved(LocalDateTime.now())
    .build()
```

**Factory Methods:**
```java
private User createTestUser() {
    return User.builder()
            .userId(1L)
            .username("testuser")
            .email("test@example.com")
            .password("password")
            .userRole(Role.USER)
            .build();
}

private Leaderboard createTestLeaderboard(User user, Category category, int wpm, int accuracy) {
    return Leaderboard.builder()
            .leaderboardId(1L)
            .user(user)
            .category(category)
            .wordsPerMinute(wpm)
            .accuracy(accuracy)
            .build();
}
```

### Test Naming Pattern

**Convention:** `{Should/ShouldNot} {action} {expected result}`

**Examples:**
- `shouldReturnGlobalLeaderboardWithDefaultMetric()`
- `shouldApplyMultiplierForHighAccuracy()`
- `shouldReturnEmptyListWhenNoEntriesExist()`
- `shouldAssignSameRankToTiedEntries()`

### Mocking Patterns

**Service Mocking (Controller Tests):**
```java
@MockBean
private LeaderboardService leaderboardService;

// In test:
when(leaderboardService.getGlobalTop10("combined"))
    .thenReturn(sampleEntries);
```

**Repository Mocking (Service Tests):**
```java
@Mock
private LeaderboardRepository leaderboardRepository;

// In test:
when(leaderboardRepository.findTop10ByCategoryOrderByWordsPerMinuteDesc(Category.TYPING_TESTS))
    .thenReturn(entries);
```

**Argument Matchers:**
```java
when(leaderboardService.getGlobalTop10(anyString()))
    .thenReturn(Collections.emptyList());

when(leaderboardService.getUserRankings(anyLong()))
    .thenReturn(sampleEntries);
```

## Coverage

### Backend Coverage
- No coverage enforcement found in `pom.xml`
- Manual coverage checking with IDE tools or Maven plugins

### Frontend Coverage
- Available via Jest: `npm test -- --coverage`
- Output location: `coverage/` directory

## Known Gaps

**Backend:**
- Only `Leaderboard*` classes have comprehensive tests
- Other services, controllers, and repositories lack tests
- No integration tests with real database (all use `@DataJpaTest` with embedded H2)
- No test profiles configuration (`application-test.properties` not found)

**Frontend:**
- Only `App.test.js` exists (default CRA template test)
- No tests for page components (`LoginPage`, `LeaderboardPage`, etc.)
- No component-level tests for `Navbar`, `ProtectedRoute`, etc.
- No API integration tests
- No mocking of API calls

---

*Testing analysis: 2026-03-25*
