# Phase 1: Leaderboard Data Layer - Research

**Researched:** 2026-03-23
**Phase:** 01-leaderboard-data-layer

---

## Validation Architecture

This is a Spring Boot 3.4.4 backend with Java 17. No existing test framework detected in provided files.

### Test Infrastructure (Wave 0 Required)

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Spring Boot Test |
| **Config file** | pom.xml (Spring Boot Starter Test already included) |
| **Quick run command** | `mvn test -Dtest=*Leaderboard*` |
| **Full suite command** | `mvn test` |
| **Estimated runtime** | ~30-60 seconds |

### Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Performance < 200ms | Requires load testing | Manual: `curl` with timing, observe logs |
| Database indexes | DDL verification | Review migration/schema, explain plan |

---

## Technical Research

### Existing Codebase Patterns

**Repository Pattern:**
- Extends `JpaRepository<Entity, Long>`
- Custom query methods: `findByCategory(Category)`, `findByUser(User)`

**Service Pattern:**
- `@Service` annotation
- `@RequiredArgsConstructor` for dependency injection
- Methods return `Optional<T>` or `List<T>`

**Controller Pattern:**
- `@RestController` + `@RequestMapping("/api/...")`
- `@RequiredArgsConstructor`
- ResponseEntity<T> returns
- `@PreAuthorize` for role-based access

**DTO Pattern:**
- `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
- Service contains `convertToDTO()` and `convertFromDTO()` methods

### Required Implementations

#### 1. New Endpoints (LB-01)

| Endpoint | Description | Return Type |
|----------|-------------|-------------|
| `GET /api/leaderboard/global` | Top 10 scores across all games | `List<LeaderboardEntry>` |
| `GET /api/leaderboard/game/{category}` | Top 10 for specific game | `List<LeaderboardEntry>` |
| `GET /api/leaderboard/user/{userId}` | Best score per game for user | `UserRankings` |

#### 2. LeaderboardEntry DTO (LB-03)

```java
@Data @Builder
public class LeaderboardEntry {
    private Integer rank;
    private String username;
    private Double score;      // Combined: WPM × (Accuracy/100) × 1.5 if acc > 95%
    private Integer wpm;
    private Integer accuracy;
    private String gameName;  // Category display name
    private LocalDateTime dateAchieved;
}
```

#### 3. Combined Score Calculation (Context Decision)

```
combinedScore = wpm × (accuracy / 100)
if (accuracy > 95) combinedScore *= 1.5
```

#### 4. Database Optimization (LB-04)

**Required Indexes:**
```sql
CREATE INDEX idx_leaderboard_score ON leaderboards(score DESC);
CREATE INDEX idx_leaderboard_category_score ON leaderboards(category, score DESC);
CREATE INDEX idx_leaderboard_user_category ON leaderboards(user_id, category);
```

**Implementation:** Add `@Table(indexes = {...})` to Leaderboard entity or use migration.

#### 5. Query Optimization

**Top 10 Query Pattern (Spring Data JPA):**
```java
@Query("SELECT l FROM Leaderboard l WHERE l.category = :category ORDER BY l.score DESC LIMIT 10")
List<Leaderboard> findTop10ByCategory(@Param("category") Category category);
```

**Native Query (if needed):**
```java
@Query(value = "SELECT * FROM leaderboards WHERE category = :cat ORDER BY score DESC LIMIT 10", nativeQuery = true)
```

### Caching Strategy (Context Decision)

- **Cache:** 1-minute TTL using Spring Cache (`@Cacheable`)
- **Pattern:** `@Cacheable(value = "leaderboard", key = "#category.name()")`

### Session History (Context Decision)

Per user decisions:
- Add `recentGames` JSON array to Leaderboard entity
- Store entire history, select window when viewing
- Use `VARCHAR` or `JSON` column type

### Multi-Metric Support (Context Decision)

| Metric | Sort Field | Display Name |
|--------|------------|--------------|
| WPM | wordsPerMinute | "Words Per Minute" |
| Accuracy | accuracy | "Accuracy %" |
| Combined | calculated | "Combined Score" |

Toggle affects query ORDER BY clause.

---

## Don't Hand-Roll

| Use This | Not This | Reason |
|----------|----------|--------|
| Spring Data JPA `@Query` | Manual SQL | Type-safe, portable |
| Spring Cache | custom caching | Built-in, configurable |
| Pageable | manual offset | Standard Spring pattern |
| Stream `.toList()` | `.collect(Collectors.toList())` | Java 17+ idiomatic |

---

## Common Pitfalls

1. **N+1 Queries:** Always fetch user with join or use `@EntityGraph`
2. **Missing Indexes:** Leaderboard table needs composite index on (category, score)
3. **Ties in Ranking:** Sequential ranks for ties (use window function or post-process)
4. **Cache Invalidation:** Update cache on new score submission
5. **Null User:** Handle orphaned leaderboard entries gracefully

---

## Implementation Order

1. **Wave 1:** LeaderboardEntry DTO, extend repository with ranking queries
2. **Wave 2:** LeaderboardService with aggregation and combined score logic
3. **Wave 3:** Controller with new endpoints, add indexes to entity
4. **Wave 4:** Session history field, caching

---

## Stack Summary

| Component | Technology |
|-----------|-----------|
| Framework | Spring Boot 3.4.4 |
| Language | Java 17 |
| Database | MySQL + PostgreSQL |
| ORM | Spring Data JPA |
| Security | Spring Security (JWT configured) |
| Build | Maven |
