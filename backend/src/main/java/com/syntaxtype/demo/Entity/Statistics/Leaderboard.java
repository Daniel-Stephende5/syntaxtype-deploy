package com.syntaxtype.demo.Entity.Statistics;

import com.syntaxtype.demo.Entity.Enums.Category;
import com.syntaxtype.demo.Entity.Users.User;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "leaderboards", indexes = {
    @Index(name = "idx_category_wpm", columnList = "category, wordsPerMinute DESC"),
    @Index(name = "idx_category_accuracy", columnList = "category, accuracy DESC"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_user", columnList = "user_id")
})
@Builder
public class Leaderboard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long leaderboardId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Integer wordsPerMinute;
    private Integer accuracy;
    private Integer totalWordsTyped;
    private Integer totalTimeSpent;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;
}