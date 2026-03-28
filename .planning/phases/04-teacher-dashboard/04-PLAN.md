# Phase 4 Plan: Teacher Dashboard & Student Progress

**Phase:** 4  
**Name:** Teacher Dashboard & Student Progress  
**Status:** Planning  
**Created:** 2026-03-26

---

## Overview

Enable teachers to view and monitor student progress. Teachers can see student scores, game performance trends, and provide guidance based on data.

---

## Requirements

| ID | Requirement |
|----|-------------|
| TCHR-01 | Teacher can view list of assigned students |
| TCHR-02 | Teacher can view individual student progress (games played, scores, WPM) |
| TCHR-03 | Teacher can view class/section leaderboard |
| TCHR-04 | Student profiles show assigned teacher info |
| TCHR-05 | API endpoints secured for teacher access only |

---

## Success Criteria

1. ✅ Teacher can view assigned student list
2. ✅ Teacher can view individual student stats (games, scores, WPM trends)
3. ✅ Teacher can view class leaderboard
4. ✅ Student profile shows teacher assignment
5. ✅ All endpoints require TEACHER or ADMIN role

---

## Implementation Approach

### Backend

1. **Student-Teacher Association**
   - Already exists: `StudentTopics` and `TeacherTopics` junction tables
   - Need: Endpoint to get students assigned to a teacher

2. **New API Endpoints**

```java
// TeacherController additions

// Get students assigned to teacher
@GetMapping("/{teacherId}/students")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public List<StudentProgressDTO> getTeacherStudents(@PathVariable Long teacherId) {
    // Return list of students with basic progress info
}

// Get individual student progress
@GetMapping("/students/{studentId}/progress")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public StudentProgressDTO getStudentProgress(@PathVariable Long studentId) {
    // Return detailed progress: games played, scores, WPM trends
}

// Get class leaderboard for teacher's students
@GetMapping("/{teacherId}/leaderboard")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public List<LeaderboardEntry> getClassLeaderboard(@PathVariable Long teacherId) {
    // Return leaderboard of teacher's assigned students
}
```

3. **DTOs Needed**
   - `StudentProgressDTO` - name, games played, best scores by game, WPM trends

### Frontend

1. **Teacher Dashboard Page**
   - List of assigned students
   - Quick stats per student
   - Link to detailed view

2. **Student Detail Page**
   - Individual student progress
   - Charts/graphs of improvement over time
   - Scores by game category

3. **Class Leaderboard**
   - Leaderboard filtered to teacher's students only
   - Same format as main leaderboard

---

## Files to Modify/Create

**Backend:**
- `DTO/users/StudentProgressDTO.java` (new)
- `Controller/users/TeacherController.java` (add endpoints)
- `Service/users/TeacherService.java` (add methods)

**Frontend:**
- `pages/TeacherDashboard.js` (new)
- `pages/TeacherStudentDetail.js` (new)
- `App.js` (add routes)

---

## Notes

- **IMPORTANT: DO NOT PUSH TO ORIGIN** - Changes will break production
- Extended lessons are face-to-face (IRL) - not in system
- Student enrollments (topics) are DEPRECATED - not used for Phase 4
- Using direct student list approach (not topic-based)
