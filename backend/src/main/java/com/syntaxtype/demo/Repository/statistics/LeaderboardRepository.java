package com.syntaxtype.demo.Repository.statistics;

import com.syntaxtype.demo.Entity.Statistics.Leaderboard;
import com.syntaxtype.demo.Entity.Users.User;
import com.syntaxtype.demo.Entity.Enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByUser(User user);
    List<Leaderboard> findByWordsPerMinute(Integer wordsPerMinute);
    List<Leaderboard> findByAccuracy(Integer accuracy);
    List<Leaderboard> findByTotalWordsTyped(Integer totalWordsTyped);
    List<Leaderboard> findByTotalTimeSpent(Integer totalTimeSpent);
    List<Leaderboard> findByCategory(Category category);

    /**
     * Retrieves top 10 leaderboard entries for a category ordered by WPM descending.
     * Joins user data for efficient fetching.
     *
     * @param category The game category
     * @return List of top 10 Leaderboard entries by WPM
     */
    @Query("SELECT l FROM Leaderboard l JOIN FETCH l.user WHERE l.category = :category ORDER BY l.wordsPerMinute DESC")
    List<Leaderboard> findTop10ByCategoryOrderByWordsPerMinuteDesc(@Param("category") Category category);

    /**
     * Retrieves top 10 leaderboard entries for a category ordered by accuracy descending.
     * Joins user data for efficient fetching.
     *
     * @param category The game category
     * @return List of top 10 Leaderboard entries by accuracy
     */
    @Query("SELECT l FROM Leaderboard l JOIN FETCH l.user WHERE l.category = :category ORDER BY l.accuracy DESC")
    List<Leaderboard> findTop10ByCategoryOrderByAccuracyDesc(@Param("category") Category category);

    /**
     * Retrieves all leaderboard entries for a category ordered by WPM descending.
     * Used for combined score calculation.
     *
     * @param category The game category
     * @return List of all Leaderboard entries by WPM for the category
     */
    List<Leaderboard> findByCategoryOrderByWordsPerMinuteDesc(Category category);

    /**
     * Retrieves all leaderboard entries for a category ordered by accuracy descending.
     * Used for combined score calculation.
     *
     * @param category The game category
     * @return List of all Leaderboard entries by accuracy for the category
     */
    List<Leaderboard> findByCategoryOrderByAccuracyDesc(Category category);

    /**
     * Retrieves top entries for all categories for a specific user.
     * Used for global leaderboard and user rankings.
     *
     * @param userId The user ID
     * @return List of leaderboard entries for the user across all categories
     */
    @Query("SELECT l FROM Leaderboard l JOIN FETCH l.user WHERE l.user.userId = :userId")
    List<Leaderboard> findAllByUserId(@Param("userId") Long userId);

    /**
     * Retrieves top entries across all categories ordered by WPM descending.
     * Used for global leaderboard.
     *
     * @return List of top leaderboard entries by WPM across all categories
     */
    @Query("SELECT l FROM Leaderboard l JOIN FETCH l.user ORDER BY l.wordsPerMinute DESC")
    List<Leaderboard> findTopByWordsPerMinute();
}
