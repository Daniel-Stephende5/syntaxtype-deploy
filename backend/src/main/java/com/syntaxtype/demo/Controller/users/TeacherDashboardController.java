package com.syntaxtype.demo.Controller.users;

import com.syntaxtype.demo.DTO.statistics.LeaderboardEntry;
import com.syntaxtype.demo.DTO.users.StudentProgressDTO;
import com.syntaxtype.demo.Service.users.TeacherService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for teacher dashboard endpoints.
 * Provides access to student progress and class leaderboard data.
 */
@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherDashboardController {
    private final TeacherService teacherService;

    /**
     * Get all students with their progress information.
     * Used for the teacher dashboard overview.
     *
     * @return List of StudentProgressDTO for all students
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @GetMapping("/students")
    public ResponseEntity<List<StudentProgressDTO>> getAllStudentsWithProgress() {
        List<StudentProgressDTO> students = teacherService.getAllStudentsWithProgress();
        return ResponseEntity.ok(students);
    }

    /**
     * Get detailed progress for a specific student.
     *
     * @param studentId The user ID of the student
     * @return StudentProgressDTO with detailed information, or 404 if not found
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @GetMapping("/students/{studentId}")
    public ResponseEntity<StudentProgressDTO> getStudentProgress(@PathVariable Long studentId) {
        StudentProgressDTO progress = teacherService.getStudentProgress(studentId);
        if (progress == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(progress);
    }

    /**
     * Get class leaderboard with all students ranked by combined score.
     * Combines WPM and accuracy to calculate a unified score.
     *
     * @return List of LeaderboardEntry sorted by combined score descending
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getClassLeaderboard() {
        List<LeaderboardEntry> leaderboard = teacherService.getClassLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
}
