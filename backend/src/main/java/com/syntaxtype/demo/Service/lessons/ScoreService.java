package com.syntaxtype.demo.Service.lessons;

import com.syntaxtype.demo.Entity.Lessons.Score;
import com.syntaxtype.demo.Repository.lessons.ScoreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;

    public ScoreService(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    // Save a score (sets submittedAt manually just in case)
    public Score saveScore(Score score) {
        score.setSubmittedAt(LocalDateTime.now()); // Ensure it's current time
        return scoreRepository.save(score);
    }

    // Get all scores (any type)
    public List<Score> getAllScores() {
        return scoreRepository.findAll();
    }

    // Get scores by type (e.g., "falling"), ordered by submittedAt (newest first)
    public List<Score> getScoresByTypeDesc(String type) {
        return scoreRepository.findByChallengeTypeOrderBySubmittedAtDesc(type);
    }

    // Get top N scores for a type (e.g., top 10 falling test scores)

    // Get all scores for a specific user
    public List<Score> getScoresByUserId(Long userId) {
        return scoreRepository.findByUserUserIdOrderBySubmittedAtDesc(userId);
    }

}
