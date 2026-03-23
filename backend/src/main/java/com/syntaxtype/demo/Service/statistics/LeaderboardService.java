package com.syntaxtype.demo.Service.statistics;

import com.syntaxtype.demo.DTO.statistics.LeaderboardDTO;
import com.syntaxtype.demo.DTO.statistics.LeaderboardEntry;
import com.syntaxtype.demo.Entity.Statistics.Leaderboard;
import com.syntaxtype.demo.Entity.Users.User;
import com.syntaxtype.demo.Entity.Enums.Category;
import com.syntaxtype.demo.Repository.statistics.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;

    public List<LeaderboardDTO> findAll() {
        return leaderboardRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    public Optional<LeaderboardDTO> findByLeaderboardId(Long leaderboardId) {
        return leaderboardRepository.findById(leaderboardId)
                .map(this::convertToDTO);
    }

    public Optional<LeaderboardDTO> findByUser(User user) {
        return leaderboardRepository.findByUser(user)
                .map(this::convertToDTO);
    }

    public List<LeaderboardDTO> findByWordsPerMinute(Integer wordsPerMinute) {
        return leaderboardRepository.findByWordsPerMinute(wordsPerMinute).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<LeaderboardDTO> findByAccuracy(Integer accuracy) {
        return leaderboardRepository.findByAccuracy(accuracy).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<LeaderboardDTO> findByTotalWordsTyped(Integer totalWordsTyped) {
        return leaderboardRepository.findByTotalWordsTyped(totalWordsTyped).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<LeaderboardDTO> findByTotalTimeSpent(Integer totalTimeSpent) {
        return leaderboardRepository.findByTotalTimeSpent(totalTimeSpent).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<LeaderboardDTO> findByCategory(Category category) {
        return leaderboardRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public LeaderboardDTO save(LeaderboardDTO leaderboardDTO, User user) {
        Leaderboard leaderboard = convertFromDTO(leaderboardDTO, user);
        return convertToDTO(leaderboardRepository.save(leaderboard));
    }

    // PATCH: Update words per minute
    public LeaderboardDTO updateWordsPerMinute(Long leaderboardId, Integer newWpm) {
        Optional<Leaderboard> leaderboardOpt = leaderboardRepository.findById(leaderboardId);
        if (leaderboardOpt.isPresent()) {
            Leaderboard leaderboard = leaderboardOpt.get();
            leaderboard.setWordsPerMinute(newWpm);
            return convertToDTO(leaderboardRepository.save(leaderboard));
        }
        return null;
    }

    // PATCH: Update accuracy
    public LeaderboardDTO updateAccuracy(Long leaderboardId, Integer newAccuracy) {
        Optional<Leaderboard> leaderboardOpt = leaderboardRepository.findById(leaderboardId);
        if (leaderboardOpt.isPresent()) {
            Leaderboard leaderboard = leaderboardOpt.get();
            leaderboard.setAccuracy(newAccuracy);
            return convertToDTO(leaderboardRepository.save(leaderboard));
        }
        return null;
    }

    // PATCH: Update total words typed
    public LeaderboardDTO updateTotalWordsTyped(Long leaderboardId, Integer newTotalWordsTyped) {
        Optional<Leaderboard> leaderboardOpt = leaderboardRepository.findById(leaderboardId);
        if (leaderboardOpt.isPresent()) {
            Leaderboard leaderboard = leaderboardOpt.get();
            leaderboard.setTotalWordsTyped(newTotalWordsTyped);
            return convertToDTO(leaderboardRepository.save(leaderboard));
        }
        return null;
    }

    // PATCH: Update total time spent
    public LeaderboardDTO updateTotalTimeSpent(Long leaderboardId, Integer newTotalTimeSpent) {
        Optional<Leaderboard> leaderboardOpt = leaderboardRepository.findById(leaderboardId);
        if (leaderboardOpt.isPresent()) {
            Leaderboard leaderboard = leaderboardOpt.get();
            leaderboard.setTotalTimeSpent(newTotalTimeSpent);
            return convertToDTO(leaderboardRepository.save(leaderboard));
        }
        return null;
    }

    // PATCH: Update category
    public LeaderboardDTO updateCategory(Long leaderboardId, Category newCategory) {
        Optional<Leaderboard> leaderboardOpt = leaderboardRepository.findById(leaderboardId);
        if (leaderboardOpt.isPresent()) {
            Leaderboard leaderboard = leaderboardOpt.get();
            leaderboard.setCategory(newCategory);
            return convertToDTO(leaderboardRepository.save(leaderboard));
        }
        return null;
    }

    // ============ Ranking Methods ============

    /**
     * Get top 10 leaderboard entries for a category ordered by WPM.
     *
     * @param category The game category
     * @return List of top 10 LeaderboardEntry with calculated ranks
     */
    public List<LeaderboardEntry> getTop10ByWpm(Category category) {
        List<Leaderboard> entries = leaderboardRepository.findTop10ByCategoryOrderByWordsPerMinuteDesc(category);
        return assignRanksWithTies(entries, "wpm");
    }

    /**
     * Get top 10 leaderboard entries for a category ordered by accuracy.
     *
     * @param category The game category
     * @return List of top 10 LeaderboardEntry with calculated ranks
     */
    public List<LeaderboardEntry> getTop10ByAccuracy(Category category) {
        List<Leaderboard> entries = leaderboardRepository.findTop10ByCategoryOrderByAccuracyDesc(category);
        return assignRanksWithTies(entries, "accuracy");
    }

    /**
     * Get top 10 leaderboard entries for a category ordered by combined score.
     * Combined score = wpm * (accuracy / 100.0) with 1.5x multiplier if accuracy > 95
     *
     * @param category The game category
     * @return List of top 10 LeaderboardEntry with calculated ranks
     */
    public List<LeaderboardEntry> getTop10ByCombinedScore(Category category) {
        // Get all entries for the category and sort by combined score in memory
        List<Leaderboard> allEntries = leaderboardRepository.findByCategoryOrderByWordsPerMinuteDesc(category);
        
        // Calculate combined scores and sort
        List<Leaderboard> sortedByCombined = allEntries.stream()
                .sorted((a, b) -> {
                    Double scoreA = LeaderboardEntry.calculateCombinedScore(a.getWordsPerMinute(), a.getAccuracy());
                    Double scoreB = LeaderboardEntry.calculateCombinedScore(b.getWordsPerMinute(), b.getAccuracy());
                    return scoreB.compareTo(scoreA); // Descending order
                })
                .limit(10)
                .toList();
        
        return assignRanksWithTies(sortedByCombined, "combined");
    }

    /**
     * Get global top 10 leaderboard entries across all categories.
     * Shows best per user per metric (user's best WPM, accuracy, or combined across all games).
     *
     * @param metricType The metric to rank by: "wpm", "accuracy", or "combined"
     * @return List of top 10 LeaderboardEntry with calculated ranks
     */
    public List<LeaderboardEntry> getGlobalTop10(String metricType) {
        // Get all entries and find best per user
        List<Leaderboard> allEntries = leaderboardRepository.findTopByWordsPerMinute();
        
        // Group by user and find best entry per user for the given metric
        Map<Long, Leaderboard> bestPerUser = new HashMap<>();
        
        for (Leaderboard entry : allEntries) {
            Long userId = entry.getUser().getUserId();
            Leaderboard existing = bestPerUser.get(userId);
            
            if (existing == null) {
                bestPerUser.put(userId, entry);
            } else {
                // Compare based on metric type
                boolean isBetter = switch (metricType.toLowerCase()) {
                    case "wpm" -> entry.getWordsPerMinute() > existing.getWordsPerMinute();
                    case "accuracy" -> entry.getAccuracy() > existing.getAccuracy();
                    case "combined" -> LeaderboardEntry.calculateCombinedScore(entry.getWordsPerMinute(), entry.getAccuracy())
                            > LeaderboardEntry.calculateCombinedScore(existing.getWordsPerMinute(), existing.getAccuracy());
                    default -> false;
                };
                
                if (isBetter) {
                    bestPerUser.put(userId, entry);
                }
            }
        }
        
        // Sort by the specified metric and take top 10
        List<Leaderboard> top10 = bestPerUser.values().stream()
                .sorted((a, b) -> {
                    int comparison = switch (metricType.toLowerCase()) {
                        case "wpm" -> b.getWordsPerMinute().compareTo(a.getWordsPerMinute());
                        case "accuracy" -> b.getAccuracy().compareTo(a.getAccuracy());
                        case "combined" -> LeaderboardEntry.calculateCombinedScore(b.getWordsPerMinute(), b.getAccuracy())
                                .compareTo(LeaderboardEntry.calculateCombinedScore(a.getWordsPerMinute(), a.getAccuracy()));
                        default -> 0;
                    };
                    return comparison;
                })
                .limit(10)
                .toList();
        
        return assignRanksWithTies(top10, metricType.toLowerCase());
    }

    /**
     * Get all rankings for a specific user across all categories.
     *
     * @param userId The user ID
     * @return List of LeaderboardEntry for all categories the user has played
     */
    public List<LeaderboardEntry> getUserRankings(Long userId) {
        List<Leaderboard> entries = leaderboardRepository.findAllByUserId(userId);
        return entries.stream()
                .map(lb -> LeaderboardEntry.fromLeaderboard(lb, null, LocalDateTime.now()))
                .collect(Collectors.toList());
    }

    /**
     * Assigns ranks to leaderboard entries, handling ties with sequential numbering.
     * Ties are assigned the same rank value, but ranks are still sequential (no rank skipping).
     *
     * @param entries List of leaderboard entries to rank
     * @param metricType The metric type: "wpm", "accuracy", or "combined"
     * @return List of LeaderboardEntry with rank values assigned
     */
    private List<LeaderboardEntry> assignRanksWithTies(List<Leaderboard> entries, String metricType) {
        if (entries == null || entries.isEmpty()) {
            return Collections.emptyList();
        }

        // Sort entries based on metric type
        List<Leaderboard> sorted = entries.stream()
                .sorted((a, b) -> {
                    int comparison = switch (metricType.toLowerCase()) {
                        case "wpm" -> b.getWordsPerMinute().compareTo(a.getWordsPerMinute());
                        case "accuracy" -> b.getAccuracy().compareTo(a.getAccuracy());
                        case "combined" -> LeaderboardEntry.calculateCombinedScore(b.getWordsPerMinute(), b.getAccuracy())
                                .compareTo(LeaderboardEntry.calculateCombinedScore(a.getWordsPerMinute(), a.getAccuracy()));
                        default -> 0;
                    };
                    return comparison;
                })
                .toList();

        List<LeaderboardEntry> result = new ArrayList<>();
        int currentRank = 1;
        
        for (int i = 0; i < sorted.size(); i++) {
            Leaderboard lb = sorted.get(i);
            
            // Check for ties: if current entry has same score as previous, use same rank
            if (i > 0) {
                Leaderboard prev = sorted.get(i - 1);
                boolean isSameScore = switch (metricType.toLowerCase()) {
                    case "wpm" -> lb.getWordsPerMinute().equals(prev.getWordsPerMinute());
                    case "accuracy" -> lb.getAccuracy().equals(prev.getAccuracy());
                    case "combined" -> Objects.equals(
                            LeaderboardEntry.calculateCombinedScore(lb.getWordsPerMinute(), lb.getAccuracy()),
                            LeaderboardEntry.calculateCombinedScore(prev.getWordsPerMinute(), prev.getAccuracy()));
                    default -> false;
                };
                
                if (isSameScore) {
                    // Same rank value as previous
                } else {
                    // Sequential rank (not skipping tied ranks)
                    currentRank = i + 1;
                }
            }
            
            result.add(LeaderboardEntry.fromLeaderboard(lb, currentRank, LocalDateTime.now()));
        }
        
        return result;
    }

    public void deleteById(Long id) {
        leaderboardRepository.deleteById(id);
    }

    public LeaderboardDTO convertToDTO(Leaderboard leaderboard) {
        if (leaderboard == null) return null;
        return LeaderboardDTO.builder()
                .leaderboardId(leaderboard.getLeaderboardId())
                .userId(leaderboard.getUser() != null ? leaderboard.getUser().getUserId() : null)
                .wordsPerMinute(leaderboard.getWordsPerMinute())
                .accuracy(leaderboard.getAccuracy())
                .totalWordsTyped(leaderboard.getTotalWordsTyped())
                .totalTimeSpent(leaderboard.getTotalTimeSpent())
                .category(leaderboard.getCategory())
                .build();
    }

    public Leaderboard convertFromDTO(LeaderboardDTO dto, User user) {
        if (dto == null) return null;
        Leaderboard leaderboard = new Leaderboard();
        leaderboard.setLeaderboardId(dto.getLeaderboardId());
        leaderboard.setUser(user);
        leaderboard.setWordsPerMinute(dto.getWordsPerMinute());
        leaderboard.setAccuracy(dto.getAccuracy());
        leaderboard.setTotalWordsTyped(dto.getTotalWordsTyped());
        leaderboard.setTotalTimeSpent(dto.getTotalTimeSpent());
        leaderboard.setCategory(dto.getCategory());
        return leaderboard;
    }
}
