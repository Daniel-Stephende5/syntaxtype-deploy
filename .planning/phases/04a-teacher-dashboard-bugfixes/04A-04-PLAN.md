---
phase: 04A-teacher-dashboard-bugfixes
plan: '04'
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java
  - backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java
autonomous: true
requirements: []
---

<objective>
Fix Teacher Dashboard analytics by calculating average WPM, accuracy, and recent activity from the Score table instead of relying on empty UserStatistics and Scoring tables.
</objective>

<context>
@backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java
@backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java
@backend/src/main/java/com/syntaxtype/demo/Entity/Lessons/Score.java
</context>

<tasks>

<task type="auto">
  <name>task 1: Add ScoreRepository method to aggregate by user</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java</files>
  <action>
Add methods to ScoreRepository for aggregating scores by user:
```java
List<Score> findByUserUserIdOrderBySubmittedAtDesc(Long userId);

@Query("SELECT AVG(s.wpm) FROM Score s WHERE s.user.userId = :userId")
Double findAverageWpmByUserId(@Param("userId") Long userId);

@Query("SELECT AVG(s.accuracy) FROM Score s WHERE s.user.userId = :userId")
Double findAverageAccuracyByUserId(@Param("userId") Long userId);

@Query("SELECT COUNT(s) FROM Score s WHERE s.user.userId = :userId")
Long countByUserId(@Param("userId") Long userId);
```

Note: Add accuracy field to Score entity if not present.
  </action>
  <verify>
<automated>grep -l "findAverageWpmByUserId" backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java</automated>
  <done>ScoreRepository has aggregation methods</done>
</task>

<task type="auto">
  <name>task 2: Add accuracy field to Score entity</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Entity/Lessons/Score.java</files>
  <action>
Add accuracy field to Score entity:
```java
private Double accuracy;
```

Update getters/setters. The field will be populated from ScoreSubmissionRequest.
  </action>
  <verify>
<automated>grep -l "accuracy" backend/src/main/java/com/syntaxtype/demo/Entity/Lessons/Score.java</automated>
  <done>Score entity has accuracy field</done>
</task>

<task type="auto">
  <name>task 3: Update ScoreController to save accuracy</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java</files>
  <action>
Update the POST /api/scores/{category} endpoint to save accuracy:
```java
score.setAccuracy(Optional.ofNullable(request.getAccuracy()).orElse(100));
```
  </action>
  <verify>
<automated>grep -l "setAccuracy" backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java</automated>
  <done>ScoreController saves accuracy</done>
</task>

<task type="auto">
  <name>task 4: Update TeacherService to use Score table</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java</files>
  <action>
Update buildStudentProgressDTO method to calculate from Score table:
1. Replace UserStatistics lookup with ScoreRepository queries
2. Calculate averageWpm from AVG(s.wpm)
3. Calculate averageAccuracy from AVG(s.accuracy)  
4. Get recent activity from Score table (last 10, sorted by submittedAt DESC)
5. Calculate totalGamesPlayed as COUNT of Score entries

Example:
```java
// Get average WPM from Score table
Double avgWpm = scoreRepository.findAverageWpmByUserId(studentId);
Double avgAccuracy = scoreRepository.findAverageAccuracyByUserId(studentId);
Long totalGames = scoreRepository.countByUserId(studentId);

// Get recent activity from Score table
List<Score> recentScores = scoreRepository.findByUserUserIdOrderBySubmittedAtDesc(studentId);
```
  </action>
  <verify>
<automated>grep -l "scoreRepository" backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java</automated>
  <done>TeacherService uses ScoreRepository for analytics</done>
</task>

<task type="auto">
  <name>task 5: Inject ScoreRepository into TeacherService</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java</files>
  <action>
Add ScoreRepository dependency to TeacherService:
```java
private final ScoreRepository scoreRepository;

public TeacherService(..., ScoreRepository scoreRepository) {
    ...
    this.scoreRepository = scoreRepository;
}
```
  </action>
  <verify>
<automated>grep -l "ScoreRepository" backend/src/main/java/com/syntaxtype/demo/Service/users/TeacherService.java</automated>
  <done>TeacherService has ScoreRepository injected</done>
</task>

</tasks>

<success_criteria>
- [ ] Score entity has accuracy field
- [ ] ScoreController saves accuracy when submitting scores
- [ ] ScoreRepository has aggregation methods (avgWpm, avgAccuracy, count, recent)
- [ ] TeacherService calculates averageWpm, averageAccuracy, totalGamesPlayed from Score table
- [ ] TeacherService gets recent activity from Score table
- [ ] Teacher Dashboard shows real data (not empty/zero)
</success_criteria>

<notes>
- UserStatistics and Scoring tables remain but are no longer used for teacher analytics
- Score table already stores all submissions, making it the authoritative source
- Frontend code does not need changes - API response format stays the same
</notes>
