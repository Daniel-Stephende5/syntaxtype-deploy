# Database Documentation

**Part of:** SyntaxType - Educational Typing Platform  
**Last Updated:** 2026-03-25

---

## Schema Overview

The application uses PostgreSQL with JPA/Hibernate for ORM. Tables are auto-created on startup via `spring.jpa.hibernate.ddl-auto=update`.

## Core Tables

### users
Main user table with role-based access.

| Column | Type | Constraints |
|--------|------|-------------|
| user_id | BIGSERIAL | PRIMARY KEY |
| username | VARCHAR(255) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| user_role | VARCHAR(50) | NOT NULL (STUDENT, TEACHER, ADMIN) |
| hasTemporaryPass | BOOLEAN | DEFAULT false |
| createdAt | TIMESTAMP | Auto-generated |

### teachers
Extended user profile for teachers.

| Column | Type | Constraints |
|--------|------|-------------|
| teacher_id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY (users.user_id), UNIQUE |
| bio | TEXT | Teacher biography |
| specialty | VARCHAR(255) | Area of expertise |

### admins
Extended user profile for administrators.

| Column | Type | Constraints |
|--------|------|-------------|
| admin_id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY (users.user_id), UNIQUE |
| permissions | VARCHAR(255) | Admin permissions level |

### students
Extended user profile for students.

| Column | Type | Constraints |
|--------|------|-------------|
| student_id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY (users.user_id), UNIQUE |
| grade_level | VARCHAR(50) | Student grade/year |
| totalXp | INTEGER | Experience points earned |

### scores
Historical score records for analytics.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| score | INTEGER | NOT NULL |
| timeInSeconds | INTEGER | NOT NULL |
| challengeType | VARCHAR(255) | NOT NULL |
| wpm | DOUBLE | NOT NULL |
| submittedAt | TIMESTAMP | DEFAULT NOW() |
| user_id | BIGINT | FOREIGN KEY (users.user_id) |

### leaderboards
Best scores per user per game category.

| Column | Type | Constraints |
|--------|------|-------------|
| leaderboard_id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY, UNIQUE per category |
| category | VARCHAR(50) | NOT NULL (TYPING_TESTS, GALAXY, etc.) |
| wordsPerMinute | INTEGER | For typing games |
| accuracy | INTEGER | Percentage (0-100) |
| totalWordsTyped | INTEGER | Raw word count |
| totalTimeSpent | INTEGER | Seconds |
| score | INTEGER | For non-typing games |

**Indexes:**
- `idx_category_wpm` on (category, wordsPerMinute DESC)
- `idx_category_accuracy` on (category, accuracy DESC)
- `idx_category` on (category)
- `idx_user` on (user_id)

### lessons
Custom lessons created by teachers.

| Column | Type | Constraints |
|--------|------|-------------|
| lesson_id | BIGSERIAL | PRIMARY KEY |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | Lesson content |

### topics
Lesson groupings.

| Column | Type | Constraints |
|--------|------|-------------|
| topic_id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| description | VARCHAR(255) | |
| teacher_id | BIGINT | FOREIGN KEY (teachers) |

### quizzes
Quiz assessments for lessons.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| lesson_id | BIGINT | FOREIGN KEY (lessons.lesson_id) |
| title | VARCHAR(255) | |
| questions | JSON | Quiz questions (see Quiz Items) |

### quiz_items
Individual quiz question records.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| quiz_id | BIGINT | FOREIGN KEY (quizzes.id) |
| question_text | TEXT | The question content |
| question_type | VARCHAR(50) | Type (MULTIPLE_CHOICE, FILL_BLANK, etc.) |
| correct_answer | VARCHAR(255) | Correct answer |
| options | JSON | Answer options for multiple choice |

### challenges
Typing challenges for various game modes.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| challenge_type | VARCHAR(50) | Type of challenge |
| title | VARCHAR(255) | Challenge title |
| content | TEXT | Challenge content (code/text) |
| difficulty | VARCHAR(20) | EASY, MEDIUM, HARD |
| created_by | BIGINT | FOREIGN KEY (users.user_id) |

### galaxy_challenges
Galaxy game-specific challenge content.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| title | VARCHAR(255) | Challenge title |
| description | TEXT | Challenge description |
| difficulty | VARCHAR(20) | EASY, MEDIUM, HARD |
| category | VARCHAR(100) | Challenge category |

### user_statistics
Aggregated user statistics.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY (users.user_id), UNIQUE |
| totalGamesPlayed | INTEGER | Total games played |
| totalTimeSpent | INTEGER | Total seconds played |
| averageWpm | DOUBLE | Average WPM across games |
| averageAccuracy | DOUBLE | Average accuracy |

### achievements
Achievement definitions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| name | VARCHAR(255) | Achievement name |
| description | TEXT | Achievement description |
| icon | VARCHAR(255) | Icon identifier |
| xpReward | INTEGER | XP points awarded |

### student_achievements
User-achievement mapping (earned achievements).

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| student_id | BIGINT | FOREIGN KEY (students.student_id) |
| achievement_id | BIGINT | FOREIGN KEY (achievements.id) |
| earnedAt | TIMESTAMP | When achievement was earned |

### lesson_attempts
Lesson completion tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| student_id | BIGINT | FOREIGN KEY (students.student_id) |
| lesson_id | BIGINT | FOREIGN KEY (lessons.lesson_id) |
| score | INTEGER | Score achieved |
| completedAt | TIMESTAMP | Completion timestamp |
| timeSpent | INTEGER | Seconds spent |

### teacher_topics
Junction table for teacher-topic assignments.

| Column | Type | Constraints |
|--------|------|-------------|
| teacher_id | BIGINT | PRIMARY KEY (FK to teachers) |
| topic_id | BIGINT | PRIMARY KEY (FK to topics) |

### student_topics
Junction table for student-topic enrollments.

| Column | Type | Constraints |
|--------|------|-------------|
| student_id | BIGINT | PRIMARY KEY (FK to students) |
| topic_id | BIGINT | PRIMARY KEY (FK to topics) |
| enrolledAt | TIMESTAMP | Enrollment timestamp |
| progress | INTEGER | Progress percentage |

### scoring
Additional scoring/points system.

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY (users.user_id) |
| points | INTEGER | Points awarded |
| source | VARCHAR(100) | Source of points (game, lesson, etc.) |
| awardedAt | TIMESTAMP | When points were awarded |

## Entity Relationships

```
users (1) ──────< (1) teachers
users (1) ──────< (1) admins
users (1) ──────< (1) students
   │
   ├────< (N) scores
   │
   ├────< (N) leaderboards
   │
   ├────< (N) challenges
   │
   ├────< (N) user_statistics
   │
   ├────< (N) scoring
   │
   ├────< (N) teacher_topics
   │
   └────< (N) student_topics

teachers (1) ──────< (N) topics
   │
   └────< (N) lessons

topics (1) ──────< (N) lessons
   │
   └────< (N) quizzes
           │
           └────< (N) quiz_items

lessons (1) ──────< (N) lesson_attempts
   │
   └────< (N) quizzes

students (1) ──────< (N) student_achievements
   │
   └────< (N) student_topics

students (1) ──────< (N) lesson_attempts

achievements (1) ──────< (N) student_achievements
```

## Database Configuration

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/syntaxtype
spring.datasource.username=postgres
spring.datasource.password=your_password

# Hibernate auto-create tables
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Pool settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
```

## Migrations

Currently using `ddl-auto=update`. For production, consider:

1. **Flyway** - SQL-based migrations
2. **Liquibase** - XML/YAML-based migrations

Example Flyway setup:
```bash
# Add to pom.xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               USERS & PROFILES                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   teachers    │           │    admins     │           │   students    │
├───────────────┤           ├───────────────┤           ├───────────────┤
│ teacher_id(PK)│           │ admin_id (PK) │           │ student_id(PK)│
│ user_id (FK)  │           │ user_id (FK)  │           │ user_id (FK)  │
└───────────────┘           └───────────────┘           └───────┬───────┘
        │                                                   │
        │                                                   │
        ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LESSONS & TOPICS                                   │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│    topics     │           │    lessons    │           │quiz_items     │
├───────────────┤           ├───────────────┤           ├───────────────┤
│ topic_id (PK) │──┐    │ lesson_id (PK) │    │ id (PK)         │
│ name          │  │    │ title          │    │ quiz_id (FK)    │
│ teacher_id────┘  │    │ content        │    │ question_text   │
└───────────────┘  │    │ topic_id (FK)──│────┘ question_type  │
                    │    └───────────────┘          options (JSON)  │
                    │            │                          ▲        │
                    │            ▼                          │        │
                    │    ┌───────────────┐                  │        │
                    │    │   quizzes     │──────────────────┘        │
                    │    ├───────────────┤                          │
                    │    │ id (PK)       │                          │
                    │    │ lesson_id (FK)│                          │
                    │    │ title         │                          │
                    │    │ questions(JSON)                          │
                    │    └───────────────┘                          │
                    │                                                │
┌──────────────────┴────────────────────────────────────────────────┐
│                         GAMES & SCORES                               │
└────────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   challenges  │ │leaderboards  │ │    scores     │
├───────────────┤ ├───────────────┤ ├───────────────┤
│ id (PK)       │ │leaderboard_id│ │ id (PK)       │
│ challenge_type│ │user_id (FK)  │ │ score         │
│ title         │ │category      │ │ timeInSeconds │
│ content        │ │wordsPerMinute│ │ challengeType │
│ difficulty     │ │accuracy      │ │ wpm           │
│ created_by─────┘ │totalWordsTyped│ │submittedAt   │
└───────────────┘ │totalTimeSpent │ │user_id (FK)──┘
                  │score          │ └───────────────┘
                  └───────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROGRESS & TRACKING                                 │
└─────────────────────────────────────────────────────────────────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│user_statistics│           │   scoring     │           │lesson_attempts│
├───────────────┤           ├───────────────┤           ├───────────────┤
│ id (PK)       │           │ id (PK)       │           │ id (PK)       │
│ user_id (FK)  │           │ user_id (FK)  │           │ student_id(FK)│
│ totalGames    │           │ points        │           │ lesson_id (FK)│
│ totalTime     │           │ source        │           │ score         │
│ averageWpm    │           │ awardedAt     │           │ completedAt   │
│ averageAccuracy           │               │           │ timeSpent     │
└───────────────┘           └───────────────┘           └───────────────┘
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │  student_achievements │
                          ├───────────────────────┤
                          │ id (PK)              │
                          │ student_id (FK)      │
                          │ achievement_id (FK)   │
                          │ earnedAt             │
                          └───────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           JUNCTION TABLES                                    │
└─────────────────────────────────────────────────────────────────────────────┘
        │                                           │
        ▼                                           ▼
┌───────────────────────┐               ┌───────────────────────┐
│   teacher_topics      │               │   student_topics     │
├───────────────────────┤               ├───────────────────────┤
│ teacher_id (PK/FK)    │               │ student_id (PK/FK)   │
│ topic_id (PK/FK)      │               │ topic_id (PK/FK)     │
└───────────────────────┘               │ enrolledAt           │
                                        │ progress             │
                                        └───────────────────────┘
```

## Normalization Notes

| Table | 1NF | 2NF | 3NF | Notes |
|-------|-----|-----|-----|-------|
| users | ✅ | ✅ | ✅ | Clean |
| teachers/admins/students | ✅ | ✅ | ✅ | Clean inheritance |
| scores | ✅ | ✅ | ✅ | Acceptable |
| leaderboards | ✅ | ✅ | ⚠️ | Dual-purpose fields |
| challenges | ✅ | ✅ | ✅ | Clean |
| quizzes | ⚠️ | ⚠️ | ⚠️ | JSON questions column |
| quiz_items | ✅ | ✅ | ✅ | Clean |
| lessons | ✅ | ✅ | ✅ | Clean |
| topics | ✅ | ✅ | ✅ | Clean |

**Notes:**
- `quizzes.questions` uses JSON for flexibility (modern practice)
- `leaderboards.score` added to avoid misusing `totalWordsTyped`
- Future migrations may normalize `challengeType` to a categories table

## Enums

### Role
```
STUDENT, TEACHER, ADMIN
```

### Category (Game Types)
```
TYPING_TESTS, FALLING_WORDS, GALAXY, GRID, BOOKWORM, 
CROSSWORD, FOUR_PICS, CODE_CHALLENGES, MAP, 
SYNTAX_SAVER, CHALLENGES, OVERALL
```

### ChallengeType
```
TYPING, FALLING, MULTIPLE_CHOICE, FILL_BLANK, CODE
```

---

*See also: [Main README](../README.md)*
