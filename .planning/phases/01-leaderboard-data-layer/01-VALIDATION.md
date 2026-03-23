---
phase: 01
slug: leaderboard-data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Spring Boot Test |
| **Config file** | pom.xml (Spring Boot Starter Test already included) |
| **Quick run command** | `mvn test -Dtest=*Leaderboard*` |
| **Full suite command** | `mvn test` |
| **Estimated runtime** | ~30-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `mvn test -Dtest=*Leaderboard*`
- **After every plan wave:** Run `mvn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | LB-03 | unit | `mvn test -Dtest=LeaderboardEntry*` | ✅ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | LB-02 | unit | `mvn test -Dtest=LeaderboardService*` | ✅ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | LB-01 | unit | `mvn test -Dtest=LeaderboardController*` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/syntaxtype/demo/DTO/statistics/LeaderboardEntryTest.java` — test DTO construction and combined score
- [ ] `backend/src/test/java/com/syntaxtype/demo/Repository/statistics/LeaderboardRepositoryTest.java` — test ranking queries
- [ ] `backend/src/test/java/com/syntaxtype/demo/Service/statistics/LeaderboardServiceTest.java` — test aggregation logic
- [ ] `backend/src/test/java/com/syntaxtype/demo/Controller/statistics/LeaderboardControllerTest.java` — test endpoints with MockMvc

*Framework already included in pom.xml: spring-boot-starter-test*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| API response time < 200ms | LB (implicit) | Requires load testing | `time curl http://localhost:8080/api/leaderboard/global` |
| Database indexes present | LB-04 | DDL verification | Review entity indexes, run `mvn spring-boot:run` and check schema |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
