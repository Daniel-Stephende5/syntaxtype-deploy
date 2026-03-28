# Phase 4 Research: Teacher Dashboard & Student Progress

**Phase:** 4  
**Date:** 2026-03-29

---

## Domain

Enable teachers to view and monitor student progress. Teachers can see student scores, game performance, and provide guidance.

---

## Technical Approach

### Existing Codebase

**Backend (already exists):**
- `TeacherController.java` - CRUD operations for teacher profiles at `/api/teachers`
- `TeacherService.java` - Business logic for teacher operations
- `TeacherRepository.java` - JPA repository
- `TeacherDTO.java` - Data transfer object
- `StudentDTO.java` - Student data
- `LeaderboardController.java` - Existing leaderboard endpoints
- `LeaderboardEntry.java` - DTO for leaderboard entries

**Frontend (existing patterns):**
- `LeaderboardPage.js` - Existing table patterns to follow
- `ProtectedRoute.js` - Role-based access wrapper
- `useScoreSubmission.js` - API hook pattern for data fetching

### New Components Needed

**Backend:**
1. `StudentProgressDTO.java` - New DTO containing:
   - studentId, username, email
   - totalGamesPlayed
   - averageWpm, averageAccuracy
   - bestScores (Map<String, Integer> by category)
   - recentActivity (list of recent attempts)

2. `TeacherDashboardController` or extend `TeacherController`:
   - `GET /api/teacher/students` - List all students with summary
   - `GET /api/teacher/students/{id}` - Individual student detail
   - `GET /api/teacher/leaderboard` - Class leaderboard

3. `TeacherDashboardService` or extend `TeacherService`:
   - Method to get all students with progress summary
   - Method to get individual student detailed progress
   - Method to get leaderboard filtered by students

**Frontend:**
1. `TeacherDashboard.js` - Main page with:
   - Summary cards for each student (name, games played, avg WPM, avg accuracy)
   - Click to navigate to detail view
   - Class leaderboard section

2. `TeacherStudentDetail.js` - Individual student view:
   - Student info header
   - Per-game scores table
   - WPM/Accuracy trends (simple chart or table)
   - Recent activity list

3. Routes in `App.js`:
   - `/teacher/dashboard` - Protected (TEACHER, ADMIN)
   - `/teacher/students/:id` - Protected (TEACHER, ADMIN)

---

## Validation Architecture

### Backend Validation
- `@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")` on all endpoints
- Student ID validation (ensure student exists)
- Return 404 if student not found
- Return 403 if teacher not authorized to view student

### Frontend Validation
- ProtectedRoute with allowedRoles=['TEACHER', 'ADMIN']
- Loading states during API calls
- Error handling with user-friendly messages
- Empty state for no students

---

## Key Design Decisions

1. **Data Source:** Query User table for students, Leaderboard for scores, UserStatistics for aggregates

2. **Security:** Reuse existing `@PreAuthorize` pattern from TeacherController

3. **UI Pattern:** Card grid for dashboard, table for details (matching LeaderboardPage pattern)

4. **API Structure:** Flat endpoints, no nested `/teachers/{id}/students` - simpler for frontend

---

## Common Pitfalls

1. **N+1 Queries:** Fetch students then loop for scores - use JOIN FETCH or batch queries
2. **Missing Role Check:** Ensure ADMIN can also access (not just TEACHER)
3. **Null Handling:** Students with no scores should show 0/null, not crash
4. **JWT Expiration:** Long dashboard sessions may need token refresh handling

---

## Implementation Order

1. Backend DTO first (contract)
2. Backend endpoints (TeacherController additions)
3. Frontend API hooks
4. Frontend pages
5. Route wiring

---

*Research completed: 2026-03-29*
