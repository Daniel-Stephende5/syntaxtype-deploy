package com.syntaxtype.demo.DTO.statistics;

import com.syntaxtype.demo.Entity.Enums.Category;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private Long leaderboardId;
    private Long userId;
    private Integer wordsPerMinute;
    private Double accuracy;
    private Integer totalWordsTyped;
    private Integer totalTimeSpent;
    private Category category;
}
