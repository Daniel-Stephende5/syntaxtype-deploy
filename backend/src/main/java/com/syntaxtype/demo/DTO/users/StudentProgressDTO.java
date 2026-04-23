package com.syntaxtype.demo.DTO.users;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for teacher dashboard - provides student progress information.
 * Contains aggregated statistics and recent activity for a student.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressDTO {
    private Long studentId;
    private String username;
    private String email;
    private Integer totalGamesPlayed;
    private Double averageWpm;
    private Double averageAccuracy;
    private Map<String, Integer> bestScores; // category -> best score (combined)
    private List<RecentActivity> recentActivity;

    /**
     * Represents a recent game attempt by a student.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private Long activityId;
        private String category;
        private Double wpm;
        private Double accuracy;
        private Integer score;
        private LocalDateTime playedAt;
    }
}
