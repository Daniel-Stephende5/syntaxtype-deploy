---
phase: 04a-teacher-dashboard-bugfixes
plan: '01'
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java
  - backend/src/main/java/com/syntaxtype/demo/Service/lessons/ScoreService.java
  - backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java
  - frontend/src/pages/PersonalStatsDashboard.js
  - frontend/src/App.js
  - frontend/src/components/Navbar.js
autonomous: true
requirements: []
---

<objective>
Fix students being able to view their personal stats. Add endpoint to fetch user's score history and fix frontend to display it.
</objective>

<context>
@backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java
@backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java
@frontend/src/pages/PersonalStatsDashboard.js
@frontend/src/pages/StudentStatisticsPage.js (archival - do not modify)
</context>

<tasks>

<task type="auto">
  <name>task 1: Add ScoreRepository method to find scores by user</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java</files>
  <action>
Add method to find all scores by user ID:
```java
List<Score> findByUserUserIdOrderBySubmittedAtDesc(Long userId);
```
  </action>
  <verify>
<automated>grep -l "findByUserUserId" backend/src/main/java/com/syntaxtype/demo/Repository/lessons/ScoreRepository.java</automated>
  </verify>
  <done>ScoreRepository has method to fetch scores by user</done>
</task>

<task type="auto">
  <name>task 2: Add ScoreService method to get user scores</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Service/lessons/ScoreService.java</files>
  <action>
Add method to get all scores for a user:
```java
public List<Score> getScoresByUserId(Long userId) {
    return scoreRepository.findByUserUserIdOrderBySubmittedAtDesc(userId);
}
```
  </action>
  <verify>
<automated>grep -l "getScoresByUserId" backend/src/main/java/com/syntaxtype/demo/Service/lessons/ScoreService.java</automated>
  </verify>
  <done>ScoreService has method to get user scores</done>
</task>

<task type="auto">
  <name>task 3: Add endpoint to ScoreController</name>
  <files>backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java</files>
  <action>
Add endpoint to get user's score history:
```java
@GetMapping("/user/{userId}")
@PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','USER')")
public ResponseEntity<List<Score>> getUserScores(@PathVariable Long userId) {
    return ResponseEntity.ok(scoreService.getScoresByUserId(userId));
}
```
  </action>
  <verify>
<automated>grep -l "/user/{userId}" backend/src/main/java/com/syntaxtype/demo/Controller/lessons/ScoreController.java</automated>
  </verify>
  <done>New endpoint GET /api/scores/user/{userId} exists</done>
</task>

<task type="auto">
  <name>task 4: Fix PersonalStatsDashboard.js</name>
  <files>frontend/src/pages/PersonalStatsDashboard.js</files>
  <action>
Rewrite PersonalStatsDashboard.js to:
1. Get userId from JWT token
2. Fetch from /api/scores/user/{userId}
3. Display all games played with scores
4. Calculate and show personal bests per game
5. Show recent activity
  </action>
  <verify>
<manual>Navigate to /my-stats and verify data displays</verify>
  <done>PersonalStatsDashboard shows user's score history</done>
</task>

<task type="auto">
  <name>task 5: Add route to App.js</name>
  <files>frontend/src/App.js</files>
  <action>
Add route for /my-stats:
```jsx
<Route
  path="/my-stats"
  element={
    <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
      <PersonalStatsDashboard />
    </ProtectedRoute>
  }
/>
```
Import PersonalStatsDashboard at top.
  </action>
  <verify>
<automated>grep -l "/my-stats" frontend/src/App.js</automated>
  </done>Route /my-stats exists</done>
</task>

<task type="auto">
  <name>task 6: Add link to Navbar</name>
  <files>frontend/src/components/Navbar.js</files>
  <action>
Add "My Stats" link to sidebarList (visible when logged in):
```js
{ text: "My Stats", link: "/my-stats" }
```
  </action>
  <verify>
<manual>Login as student and check sidebar for My Stats link</verify>
  <done>My Stats link visible in Navbar for logged-in users</done>
</task>

</tasks>

<success_criteria>
- [ ] GET /api/scores/user/{userId} returns user's score history
- [ ] PersonalStatsDashboard.js displays all games played
- [ ] Route /my-stats accessible to STUDENT, TEACHER, ADMIN roles
- [ ] My Stats link visible in Navbar when logged in
- [ ] StudentStatisticsPage.js remains unchanged (archival)
</success_criteria>

<notes>
- Keep StudentStatisticsPage.js as-is for archival purposes (do not delete or modify)
- PersonalStatsDashboard.js replaces the broken student statistics functionality
</notes>
