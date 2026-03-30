package com.syntaxtype.demo.Repository.statistics;

import com.syntaxtype.demo.Entity.Statistics.Scoring;
import com.syntaxtype.demo.Entity.Users.User;
import com.syntaxtype.demo.Entity.Enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ScoringRepository extends JpaRepository<Scoring, Long> {
    Optional<Scoring> findByUser(User user);
    List<Scoring> findScoresByUser(User user);
    List<Scoring> findByTotalScore(Integer totalScore);
    List<Scoring> findByCorrectAnswers(Integer correctAnswers);
    List<Scoring> findByWrongAnswers(Integer wrongAnswers);
    List<Scoring> findByTotalTimeSpent(Integer totalTimeSpent);
    List<Scoring> findByAverageTimeSpentBetweenWords(Double averageTimeSpentBetweenWords);
    List<Scoring> findByAnsweredWords(List<String> answeredWords);
    List<Scoring> findByWrongWords(List<String> wrongWords);
    List<Scoring> findByCategory(Category category);
}