package com.syntaxtype.demo.Repository.lessons;

import com.syntaxtype.demo.Entity.Lessons.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByChallengeTypeOrderBySubmittedAtDesc(String challengeType);

    // Get all scores for a specific user, ordered by submitted date (newest first)
    List<Score> findByUserUserIdOrderBySubmittedAtDesc(Long userId);

    // Optional: Top N scores for falling test
}
