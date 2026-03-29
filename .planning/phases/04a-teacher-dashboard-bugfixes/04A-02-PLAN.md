---
phase: 04A-teacher-dashboard-bugfixes
plan: '02'
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java
  - frontend/src/pages/PersonalStatsDashboard.js
autonomous: true
requirements: []
---

<objective>
Fix security gap in /api/scores/user/{userId} endpoint - verify user can only access their own scores by extracting userId from JWT.
</objective>

<context>
@backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java
@frontend/src/pages/PersonalStatsDashboard.js
@.planning/phases/04A-teacher-dashboard-bugfixes/04A-01-VERIFICATION.md
</context>

<tasks>

<task type="auto">
  <name>task 1: Update ScoreController endpoint</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java</files>
  <action>
Replace the current endpoint with one that extracts userId from JWT:

```java
@GetMapping("/user/me")
@PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','USER')")
public ResponseEntity<List<Score>> getMyScores(@AuthenticationPrincipal CustomUserDetails userDetails) {
    Long userId = userDetails.getUser().getId();
    return ResponseEntity.ok(scoreService.getScoresByUserId(userId));
}
```

Remove the old @GetMapping("/user/{userId}") endpoint.
  </action>
  <verify>
<automated>grep -l "user/me" backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java</automated>
  </verify>
  <done>Endpoint extracts userId from JWT</done>
</task>

<task type="auto">
  <name>task 2: Update frontend to call new endpoint</name>
  <files>frontend/src/pages/PersonalStatsDashboard.js</files>
  <action>
Change the fetch call from:
```
/api/scores/user/${userId}
```
To:
```
/api/scores/user/me
```

Remove the userId extraction from JWT in the frontend since it's no longer needed.
  </action>
  <verify>
<automated>grep -l "/user/me" frontend/src/pages/PersonalStatsDashboard.js</automated>
  </verify>
  <done>Frontend calls /api/scores/user/me</done>
</task>

</tasks>

<success_criteria>
- [ ] Backend endpoint /api/scores/user/me extracts userId from JWT
- [ ] Old /api/scores/user/{userId} endpoint removed
- [ ] Frontend updated to call /api/scores/user/me
- [ ] No security gap - users can only fetch their own scores
</success_criteria>

<notes>
Fixes security gap identified in 04A-01 verification.
</notes>
