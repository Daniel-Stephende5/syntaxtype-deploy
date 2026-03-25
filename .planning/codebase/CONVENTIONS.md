# Coding Conventions

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- Java 17 - Backend (Spring Boot)
- JavaScript (ES6+) - Frontend (React)

**Secondary:**
- CSS with Tailwind CSS - Frontend styling

## Backend (Spring Boot) Conventions

### Project Structure

```
backend/src/
├── main/java/com/syntaxtype/demo/
│   ├── Controller/       # REST API controllers
│   │   ├── auth/         # Authentication & security
│   │   ├── users/        # User management endpoints
│   │   ├── lessons/      # Lesson content endpoints
│   │   ├── statistics/   # Stats & leaderboard endpoints
│   │   └── junctions/    # Many-to-many relationship endpoints
│   ├── Service/          # Business logic layer
│   ├── Repository/       # Data access layer (Spring Data JPA)
│   ├── Entity/           # JPA entities
│   │   ├── Users/        # User-related entities
│   │   ├── Lessons/      # Lesson content entities
│   │   ├── Statistics/   # Statistics entities
│   │   ├── Enums/        # Enum types
│   │   ├── Junctions/    # Join table entities
│   │   └── CompositeKeys/# Composite primary keys
│   ├── DTO/              # Data Transfer Objects
│   │   ├── users/
│   │   │   ├── requests/
│   │   │   └── responses/
│   │   ├── lessons/
│   │   └── statistics/
│   └── Exception/        # Exception handling
└── test/java/com/syntaxtype/demo/
    ├── Controller/       # Controller tests
    ├── Service/         # Service tests
    ├── Repository/      # Repository tests
    └── DTO/             # DTO tests
```

### Java Naming Conventions

**Files:** PascalCase
- `LeaderboardController.java`
- `LeaderboardService.java`
- `LeaderboardEntry.java`

**Classes:** PascalCase
- Use descriptive nouns
- Group related classes by feature (statistics, users, lessons)

**Methods:** camelCase
- `getGlobalTop10()`
- `findByLeaderboardId()`
- `assignRanksWithTies()`

**Variables:** camelCase
- `sampleEntries`
- `leaderboardService`
- `testUser1`

**Packages:** lowercase
- `com.syntaxtype.demo.service.statistics`
- `com.syntaxtype.demo.repository.users`

### Java Code Patterns

**Dependency Injection:**
```java
@Service
@RequiredArgsConstructor
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;
}
```

**Entity Pattern:**
```java
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "leaderboards", indexes = {...})
@Builder
public class Leaderboard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long leaderboardId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    private Integer wordsPerMinute;
    private Integer accuracy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

**DTO Pattern:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntry {
    private Integer rank;
    private String username;
    private Double score;
    
    public static LeaderboardEntry fromLeaderboard(Leaderboard lb, Integer rank, LocalDateTime date) {
        // Factory method pattern
    }
    
    public static Double calculateCombinedScore(Integer wpm, Integer accuracy) {
        // Static utility method
    }
}
```

**Repository Pattern:**
```java
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByUser(User user);
    List<Leaderboard> findByWordsPerMinute(Integer wordsPerMinute);
    
    @Query("SELECT l FROM Leaderboard l JOIN FETCH l.user WHERE l.category = :category ORDER BY l.wordsPerMinute DESC")
    List<Leaderboard> findTop10ByCategoryOrderByWordsPerMinuteDesc(@Param("category") Category category);
}
```

**Controller Pattern:**
```java
@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {
    private final LeaderboardService leaderboardService;

    @Cacheable(value = "leaderboard", key = "'global:' + #metric + ':' + #page", unless = "#result == null")
    @GetMapping("/global")
    public ResponseEntity<List<LeaderboardEntry>> getGlobalLeaderboard(
            @RequestParam(defaultValue = "combined") String metric,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(leaderboardService.getGlobalTop10(metric));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','USER')")
    @PostMapping
    public ResponseEntity<LeaderboardDTO> createLeaderboard(@RequestBody LeaderboardDTO leaderboardDTO, @RequestParam Long userId) {
        // Implementation
    }
}
```

**Service Pattern:**
```java
@Service
@RequiredArgsConstructor
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;

    public List<LeaderboardDTO> findAll() {
        return leaderboardRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }
    
    public Optional<LeaderboardDTO> findByLeaderboardId(Long leaderboardId) {
        return leaderboardRepository.findById(leaderboardId)
                .map(this::convertToDTO);
    }
    
    private LeaderboardDTO convertToDTO(Leaderboard leaderboard) {
        if (leaderboard == null) return null;
        return LeaderboardDTO.builder()
                .leaderboardId(leaderboard.getLeaderboardId())
                // ... mapping
                .build();
    }
}
```

### Java Comments

**Javadoc Style for Public Methods:**
```java
/**
 * Get top 10 leaderboard entries for a category ordered by WPM.
 *
 * @param category The game category
 * @return List of top 10 LeaderboardEntry with calculated ranks
 */
public List<LeaderboardEntry> getTop10ByWpm(Category category) {
    // ...
}
```

### Annotations Used

- `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- `@Data`, `@Getter`, `@Setter`, `@AllArgsConstructor`, `@NoArgsConstructor`, `@Builder`
- `@Service`, `@Repository`, `@RestController`, `@Controller`
- `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PatchMapping`, `@DeleteMapping`
- `@Autowired`, `@RequiredArgsConstructor` (Lombok)
- `@MockBean`, `@InjectMocks` (Mockito)
- `@BeforeEach`, `@AfterEach` (JUnit)
- `@Test`, `@DisplayName`, `@Nested`
- `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`
- `@PreAuthorize` (Spring Security)
- `@Cacheable`

## Frontend (React) Conventions

### Project Structure

```
frontend/src/
├── App.js              # Main router configuration
├── App.css             # Global styles
├── index.js            # Entry point
├── index.css           # Global CSS (Tailwind directives)
├── components/         # Reusable UI components
│   ├── Navbar.js
│   ├── ProtectedRoute.js
│   ├── PublicOnlyRoute.js
│   ├── Dashboard.js
│   ├── AdminDashboard.js
│   └── AdminManageUsers.js
├── pages/              # Page components
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── LeaderboardPage.js
│   ├── TypingTest.js
│   ├── GalaxyGame/     # Game subdirectory
│   │   ├── GalaxyMainGame.js
│   │   ├── GalaxyControls.js
│   │   └── ...
│   └── ...
├── css/                # Component-specific CSS files
│   ├── typingtest.css
│   ├── FallingTypingTest.css
│   └── ...
├── utils/              # Utility functions
│   ├── api.js          # API URL helpers
│   ├── AuthUtils.js    # Authentication utilities
│   └── JwtUtils.js     # JWT decoding utilities
├── setupTests.js       # Jest setup
└── setupProxy.js       # Dev proxy configuration
```

### JavaScript/React Naming Conventions

**Files:** PascalCase for components, camelCase for utilities
- `LeaderboardPage.js`
- `ProtectedRoute.js`
- `api.js`
- `AuthUtils.js`

**Components:** PascalCase function name, file matches component name
- `const LoginPage = () => {...}`
- `const ProtectedRoute = ({ children, allowedRoles }) => {...}`

**Variables:** camelCase
- `const [isLoading, setIsLoading] = useState(true);`
- `const selectedGame`, `selectedMetric`
- `const fetchLeaderboard`, `handleSubmit`

**Constants:** UPPER_SNAKE_CASE for config constants
```javascript
const GAME_OPTIONS = [
  { value: "", label: "All Games" },
  { value: "TypingTest", label: "Typing Test" },
];
```

### React Patterns

**State Management with useState:**
```javascript
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    // ...
};
```

**Form Handling:**
```javascript
const validateForm = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required.';
    if (!password) tempErrors.password = 'Password is required.';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
};

const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    // API call...
};
```

**API Integration with Axios:**
```javascript
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { setAuthToken } from '../utils/AuthUtils';

const response = await axios.post(`${API_BASE}/api/auth/login`, {
    email,
    password
});
setAuthToken(response.data.token);
```

**useEffect Pattern:**
```javascript
// Initial load
useEffect(() => {
    setAuthToken(getAuthToken());
    decodeCurrentUser();
}, [decodeCurrentUser]);

// Fetch on filter changes
useEffect(() => {
    fetchLeaderboard();
}, [fetchLeaderboard]);
```

**Protected Route Component:**
```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState({
        isAuthenticated: false,
        isAuthorized: false,
        userRole: null,
        // ...
    });

    useEffect(() => {
        const checkAuthAndProfile = async () => {
            // Auth checks...
            setAuthStatus({...});
            setIsLoading(false);
        };
        checkAuthAndProfile();
    }, [token, allowedRoles]);

    if (isLoading) return <div>Loading authentication...</div>;
    if (!authStatus.isAuthenticated) return <Navigate to="/login" replace />;
    if (!authStatus.isAuthorized) return <Navigate to="/unauthorized" replace />;
    return children;
};
```

**Material-UI Styling (inline sx prop):**
```javascript
<Container
    component="main"
    maxWidth="xs"
    sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '1rem'
    }}
>
    <Box sx={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.5rem' }}>
        <Typography variant="h5">Login</Typography>
    </Box>
</Container>
```

**Debounced Callbacks:**
```javascript
const metricTimeoutRef = React.useRef(null);

const handleMetricChange = (event, newMetric) => {
    if (!newMetric) return;
    setSelectedMetric(newMetric);
    
    if (metricTimeoutRef.current) {
        clearTimeout(metricTimeoutRef.current);
    }
    
    metricTimeoutRef.current = setTimeout(() => {
        fetchLeaderboard();
    }, 300);
};
```

### Router Configuration

**App.js Pattern:**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={
          <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT', 'USER']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </Router>
  );
};
```

### CSS/Styling

**Tailwind CSS:**
- Configuration: `frontend/src/tailwind.config.js`
- Main entry: `frontend/src/index.css` with `@tailwind` directives
- Utility classes used in JSX: `className="flex flex-col items-center"`

**Component-specific CSS files:**
- `frontend/src/pages/SyntaxSaverLesson.css`
- `frontend/src/pages/GridGame.css`
- `frontend/src/css/TotalDashboard.css`

## Shared Patterns

### Error Handling

**Frontend (LoginPage.js):**
```javascript
try {
    const response = await axios.post(...);
    // Success handling
} catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please check your credentials.';
    if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object' && data !== null) {
            errorMessage = data.message || data.error || JSON.stringify(data);
        }
    }
    setMessage({ text: errorMessage, type: 'error' });
}
```

**Backend (Service Pattern):**
```java
public LeaderboardDTO updateWordsPerMinute(Long leaderboardId, Integer newWpm) {
    Optional<Leaderboard> leaderboardOpt = leaderboardRepository.findById(leaderboardId);
    if (leaderboardOpt.isPresent()) {
        Leaderboard leaderboard = leaderboardOpt.get();
        leaderboard.setWordsPerMinute(newWpm);
        return convertToDTO(leaderboardRepository.save(leaderboard));
    }
    return null; // or throw exception
}
```

### Logging

- Console.log for frontend debugging: `console.log('Logged in user:', { userId, userRole });`
- console.error for API errors: `console.error('Login error:', error);`
- Backend logging not prominently observed (no logger injection)

### Imports Organization

**Frontend (LoginPage.js):**
```javascript
// 1. React imports
import React, { useState } from 'react';
// 2. Third-party imports
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
// 3. MUI imports
import { Container, Box, Typography, ... } from '@mui/material';
// 4. Local imports
import { API_BASE } from '../utils/api';
import { setAuthToken } from '../utils/AuthUtils';
```

**Backend (LeaderboardController.java):**
```java
package com.syntaxtype.demo.Controller.statistics;

import com.syntaxtype.demo.DTO.statistics.*;
import com.syntaxtype.demo.Entity.Users.User;
import com.syntaxtype.demo.Entity.Enums.Category;
import com.syntaxtype.demo.Service.statistics.LeaderboardService;
import lombok.RequiredArgsConstructor;
// ... more imports
```

---

*Convention analysis: 2026-03-25*
