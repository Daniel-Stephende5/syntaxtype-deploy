# Phase 4: Teacher Dashboard & Student Progress - Context

**Phase:** 4  
**Gathered:** 2026-03-26  
**Status:** Ready for planning

---

## Domain

Enable teachers to view and monitor student progress. Teachers can see student scores, game performance, and provide guidance.

---

## Decisions

### Area 1: Student-Teacher Association
**Status:** DEPRECATED - Not used in this phase

- Current codebase: Uses `StudentTopics` and `TeacherTopics` junction tables
- **Decision:** Leave as-is but DO NOT USE for Phase 4
- **Label:** Mark as deprecated in code comments
- **Future:** Will be replaced with direct teacher-student assignment in Phase 4+
- **Rationale:** Topic-based association is too complex for MVP timeline

### Area 2: Data Retrieval
**Status:** DECIDED

- **Approach:** Get ALL students - teacher sees ALL registered students regardless of topic enrollment
- **If student has no records:** Still visible to teacher (show 0/null stats)
- **Data sources:**
  - `User` table: get all students
  - `Leaderboard` table: get scores per student per category
  - `UserStatistics` table: get aggregate stats
  - `Score` table: get historical attempts

### Area 3: Frontend Dashboard UX
**Status:** DECIDED

- **Route structure:**
  - `/teacher/dashboard` - Summary cards view
  - `/teacher/students/:id` - Detailed student view
  - `/admin/*` - Existing admin routes (separate from teacher)
- **Layout:** Summary cards → click to expand detailed tables
- **Grouping:** NO grouping by gamemode - flat list of students
- **UI Pattern:** Card grid with quick stats, drill-down on click

---

## Implementation Notes

### Backend API
```
GET /api/teacher/students          - List all students with summary stats
GET /api/teacher/students/:id      - Detailed progress for one student
GET /api/teacher/leaderboard       - Class leaderboard (all students)
```

### Frontend Pages
```
/teacher/dashboard         - Summary cards (name, games played, avg WPM, avg accuracy)
/teacher/students/:id      - Detailed tables (per-game scores, history)
```

### Data Fields Per Student
| Field | Source |
|-------|--------|
| username | User table |
| email | User table |
| totalGamesPlayed | Count from Score table |
| averageWpm | UserStatistics or calculated |
| averageAccuracy | UserStatistics or calculated |
| bestScores | Leaderboard table by category |

---

## Code Context

### Existing Reusable Components
- `TeacherController.java` - Has profile CRUD, add student management endpoints
- `LeaderboardController.java` - Can reuse leaderboard entry format
- `useScoreSubmission.js` - Frontend hook pattern for API calls
- `LeaderboardPage.js` - Frontend table patterns

### Key Tables
- `users` - User info (id, username, email, user_role)
- `leaderboard` - Best scores per user per category
- `scores` - All score attempts
- `user_statistics` - Aggregate stats

---

## Deferred Ideas

- Topic-based student filtering (replaced with "all students" for Phase 4)
- Real-time student activity monitoring
- Custom topic/lesson assignments

---

## Important

**DO NOT PUSH TO ORIGIN** - Changes will break production. Local commits only until deployment window confirmed.

---

*Phase: 04-teacher-dashboard*
*Context gathered: 2026-03-26*
