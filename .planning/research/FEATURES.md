# Feature Landscape

**Domain:** Educational Typing Platform
**Researched:** 2026-03-14
**Project Context:** Brownfield Spring Boot + React educational platform with existing games, lessons, and progress tracking

---

## Table Stakes (Must Have)

Features users expect. Missing = product feels incomplete or users leave. Based on analysis of Typing.com, TypeTastic, TypingPal, and other market leaders.

### Core Typing Mechanics

| Feature | Why Expected | Complexity | Status (Existing) | Notes |
|---------|--------------|------------|--------------------|-------|
| WPM (Words Per Minute) tracking | Primary metric for typing proficiency | Low | ✅ Existing | Present in TypingTest, GalaxyGame |
| Accuracy measurement | Error rate is critical skill indicator | Low | ✅ Existing | Tracked in scoring system |
| Real-time feedback | Immediate correction prevents habit formation | Medium | ⚠️ Partial | Works during games, needs improvement |
| Error highlighting | Visual cues for mistakes during practice | Low | ✅ Existing | Implemented in typing tests |
| Timed typing tests | Standard assessment format | Low | ✅ Existing | Multiple game modes |

### User Accounts & Roles

| Feature | Why Expected | Complexity | Status (Existing) | Notes |
|---------|--------------|------------|--------------------|-------|
| User registration/login | Personalization requires identity | Low | ✅ Existing | JWT currently disabled |
| Role-based access (Student/Teacher/Admin) | Educational platforms need differentiated access | Medium | ✅ Existing | Well implemented |
| Progress persistence | Users expect to continue where they left off | Medium | ✅ Existing | PostgreSQL-backed |

### Basic Progress Tracking

| Feature | Why Expected | Complexity | Status (Existing) | Notes |
|---------|--------------|------------|--------------------|-------|
| Session scores | Track improvement over time | Low | ✅ Existing | Scoring system exists |
| Historical statistics | Long-term progress visibility | Medium | ⚠️ Partial | Needs dashboard improvements |
| Simple leaderboard | Social motivation | Low | ✅ Existing | Implemented |

### Lesson System

| Feature | Why Expected | Complexity | Status (Existing) | Notes |
|---------|--------------|------------|--------------------|-------|
| Structured lessons | Progressive skill building | Medium | ✅ Existing | Lessons CRUD implemented |
| Quiz functionality | Assessment of learning | Medium | ✅ Existing | QuizService exists |
| Teacher content creation | Classroom use requires this | Medium | ✅ Existing | InstructorModule exists |

---

## Differentiators (Competitive Advantage)

Features that set products apart. Not expected by all users, but highly valued. These create competitive moats.

### Advanced Gamification

| Feature | Value Proposition | Complexity | Status (Existing) | Notes |
|---------|-------------------|------------|--------------------|-------|
| **Real-time multiplayer racing** | Compete live against others | High | ❌ Missing | TypeRacer, TypeWars style |
| **Combo systems** | Reward continuous correct typing | Medium | ⚠️ Partial | GalaxyGame has combos |
| **Achievement badges** | Milestone recognition drives retention | Medium | ⚠️ Partial | Needs expansion |
| **Daily challenges** | Habit formation through streaks | Medium | ❌ Missing | Common in TypeWars, Typi |
| **XP and leveling** | Long-term engagement hook | Medium | ❌ Missing | Duolingo-style progression |
| **Streak tracking** | Consecutive practice motivation | Low | ❌ Missing | Major retention driver |

### Adaptive Learning

| Feature | Value Proposition | Complexity | Status (Existing) | Notes |
|---------|-------------------|------------|--------------------|-------|
| **Problem key identification** | Focus practice on weaknesses | Medium | ❌ Missing | TypingPal, Typesy have this |
| **Personalized practice passages** | AI-generated content for weak areas | High | ❌ Missing | Typing.com has TypeAI |
| **Skill-based difficulty adjustment** | Automatic progression | Medium | ❌ Missing | TypeTastic has adaptive paths |
| **Performance analytics per finger/hand** | Biomechanical improvement | High | ❌ Missing | Typesy tracks this |

### Enhanced Social/Competitive

| Feature | Value Proposition | Complexity | Status (Existing) | Notes |
|---------|-------------------|------------|--------------------|-------|
| **Class/group leaderboards** | Classroom competition | Medium | ⚠️ Partial | Basic leaderboard exists |
| **Friend challenges** | Social motivation | Medium | ❌ Missing |  |
| **Tournaments/events** | Time-limited competitive events | High | ❌ Missing | TypeWars has this |
| **Global rankings** | Aspiration target | Low | ⚠️ Partial | Limited scope |

### Rich Content Features

| Feature | Value Proposition | Complexity | Status (Existing) | Notes |
|---------|-------------------|------------|--------------------|-------|
| **Diverse content (code, languages, topics)** | Relevance to interests | Medium | ❌ Missing | Currently limited |
| **Custom text upload** | Practice real content | Low | ❌ Missing | TypiNation has this |
| **Story/ebook typing** | Extended practice with context | Medium | ❌ Missing | TypiNation story mode |
| **Coding language practice** | Developer-focused typing | Medium | ❌ Missing | Specialization |

### Modern UX Features

| Feature | Value Proposition | Complexity | Status (Existing) | Notes |
|---------|-------------------|------------|--------------------|-------|
| **Dark/light theme** | User preference | Low | ❌ Missing |  |
| **Sound effects toggle** | Engagement without annoyance | Low | ❌ Missing |  |
| **Keyboard shortcuts** | Power user efficiency | Low | ❌ Missing |  |
| **Mobile/tablet responsive** | Practice anywhere | High | ❌ Missing | Desktop-focused |

---

## Anti-Features

Features to explicitly NOT build. These either harm the experience, are not worth the effort, or don't align with the platform's educational mission.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|---------------------|
| **Aggressive autocorrect in practice mode** | Trains dependency, defeats muscle memory practice | Let errors show, provide feedback after |
| **Forced ads during typing** | Disrupts flow, trains bad habits | If monetization needed, use non-intrusive banner or subscription |
| **Overly complex finger placement tutorials for adults** | Annoying for returning typists | Offer optional "refresh" mode |
| **Gamification without substance** | Empty rewards erode trust | Ensure achievements reflect real skill improvement |
| **Competing priorities (social feed, etc.)** | Distracts from core learning | Keep focus on typing practice |
| **Overly child-centric UI for general audience** | Alienates adult learners | Offer theme/audience selection |
| **Real-time chat during games** | Performance issue, distraction | Post-game social features only |
| **Requiring account for casual testing** | Friction for trial | Allow guest typing tests |

---

## Feature Dependencies

Understanding what features require other features to function:

```
User Accounts (Base)
  └─> Progress Tracking
       └─> Statistics Dashboard
       └─> Leaderboards
  └─> Role-based Access
       └─> Teacher Module
       └─> Admin Dashboard

Adaptive Learning (requires)
  └─> Detailed Error Tracking
       └─> Problem Key Identification
            └─> Personalized Practice Passages

Gamification (standalone but enhances)
  └─> XP/Levels
  └─> Achievements
  └─> Streaks

Multiplayer (requires)
  └─> Real-time Infrastructure (WebSocket)
  └─> Matchmaking
```

---

## MVP Recommendation

For a brownfield project with existing functionality, prioritize improvements that require least effort for highest impact:

### Priority 1: Quick Wins (Low Effort, High Impact)

1. **Enable and fix JWT authentication** — Security baseline, required for user trust
2. **Dark/light theme toggle** — Simple UI improvement with high satisfaction
3. **Sound effects toggle** — Low effort, engagement boost
4. **Keyboard shortcuts** — Power user appreciation

### Priority 2: Core Improvements (Medium Effort)

1. **Expand achievements system** — Build on existing scoring, high engagement
2. **Daily challenges** — Streak motivation, major retention driver
3. **Problem key tracking** — Identify weaknesses automatically
4. **Class leaderboards** — Classroom value, differentiate from competitors

### Priority 3: Differentiators (Higher Effort)

1. **Real-time multiplayer** — Major competitive differentiator
2. **Adaptive difficulty** — Personalized learning
3. **Custom text upload** — User-generated content
4. **XP/leveling system** — Long-term engagement

### Priority 4: Deprioritized (Not Recommended Now)

- Mobile responsive (requires significant frontend rework)
- Real-time chat (distraction, performance cost)
- Social feeds (not core to educational mission)
- AI-generated passages (requires ML infrastructure)

---

## Gap Analysis: Existing vs Market Standard

| Category | Existing | Market Standard | Gap |
|----------|----------|-----------------|-----|
| **Core typing** | WPM, accuracy, timed tests | Same + real-time feedback | Minor |
| **Games** | 6 game modes (TypingTest, Falling, Galaxy, Grid, Bookworm, Crossword) | Multiple arcade-style games | Medium (focus on depth, not breadth) |
| **User system** | Roles, registration | Same + social login | Minor |
| **Progress** | Scores, basic leaderboard | Analytics, detailed stats | Medium |
| **Gamification** | Basic scoring | XP, levels, streaks, achievements, daily challenges | Major |
| **Adaptive learning** | None | Problem keys, difficulty adjustment | Major |
| **Multiplayer** | None | Real-time racing, PvP | Major |
| **Content** | Teacher-created lessons | Code, languages, custom text | Major |
| **UX** | Basic theme | Dark mode, responsive, accessibility | Medium |

---

## Sources

- TechRadar "Best typing tutor software of 2026" — Market overview and feature comparison
- TypingPal School Edition features — Enterprise/school market requirements
- Typing.com AI-powered personalized practice — Differentiation through AI
- TypeWars competitive features — Real-time multiplayer patterns
- TypiNation community features — Social typing features
- Typesy adaptive learning technology — Finger-level tracking
- TypeTastic K-12 curriculum — Educational progression patterns
- Reddit r/typing community feedback — User priorities and pain points
