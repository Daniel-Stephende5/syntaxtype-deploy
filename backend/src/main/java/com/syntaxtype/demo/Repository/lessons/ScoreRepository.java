package com.syntaxtype.demo.Repository.lessons;

import com.syntaxtype.demo.Entity.Lessons.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByChallengeTypeOrderBySubmittedAtDesc(String challengeType);

    // Get all scores for a specific user, ordered by submitted date (newest first)
    List<Score> findByUserUserIdOrderBySubmittedAtDesc(Long userId);

    // Aggregation methods for Teacher Dashboard analytics
    @Query("SELECT AVG(s.wpm) FROM Score s WHERE s.user.userId = :userId")
    Double findAverageWpmByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(s.accuracy) FROM Score s WHERE s.user.userId = :userId")
    Double findAverageAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(s) FROM Score s WHERE s.user.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);

    // Optional: Top N scores for falling test
}
