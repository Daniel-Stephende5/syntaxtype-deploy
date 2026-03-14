# SyntaxType - Educational Typing Platform

**Analysis Date:** 2026-03-14

## Project Overview

**What this is:** An educational typing practice platform built with Spring Boot and React, featuring multiple typing games, lesson management, and user progress tracking.

**Core value:** Help users improve typing skills through gamified practice with various game modes (classic typing, falling words, space shooter).

**Target users:** Students, teachers, and anyone wanting to improve typing speed and accuracy.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.4.4, Java 17 |
| Frontend | React 18.2.0, React Router 6 |
| Database | PostgreSQL (via JPA/Hibernate) |
| Authentication | JWT (currently disabled) |
| Build | Maven (backend), npm (frontend) |

## Validated Capabilities

The existing codebase provides:

- **User Management**: Registration, login, role-based accounts (Admin, Teacher, Student)
- **Lesson System**: Create, edit, view lessons with quiz functionality
- **Typing Games**: Multiple game modes (TypingTest, FallingTypingTest, GalaxyGame, GridGame, Bookworm, CrosswordGame)
- **Progress Tracking**: Scoring system, leaderboards, statistics
- **Admin Dashboard**: User management, analytics
- **Teacher Module**: Lesson creation and management

## Active Requirements

- [ ] **Security Hardening**: Fix hardcoded credentials, enable JWT authentication
- [ ] **Error Handling**: Enable exception handlers, proper error responses
- [ ] **Code Quality**: Address code duplication, remove stub methods
- [ ] **Frontend Updates**: Fix deprecated dependencies, complete incomplete features
- [ ] **Testing**: Expand test coverage

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use existing codebase | Brownfield project with working features | — In progress |
| Enable authentication | Currently disabled, security risk | — Pending |
| Fix hardcoded secrets | Security critical | — Pending |

## Out of Scope

- Adding new game types beyond what's already implemented
- Changing the tech stack (React/Spring Boot)
- Adding third-party integrations beyond existing APIs

---

*Last updated: 2026-03-14 after initialization*