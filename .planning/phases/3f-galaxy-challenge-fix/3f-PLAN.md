# Phase 3f Plan: Galaxy Challenge Loading Fix

**Phase:** 3f  
**Name:** Galaxy Challenge Loading Fix  
**Status:** Planning  
**Created:** 2026-03-26

---

## Overview

Fix Galaxy game to properly load challenges when accessed via URL (e.g., `/play/galaxy/123`). The game currently doesn't use the challenge ID from the URL, causing a white screen when trying to play specific challenges.

---

## Problem

**Current behavior:**
- Challenge list loads at `/galaxy-new` - shows all challenges
- Clicking a challenge navigates to `/play/galaxy/:id`
- `GalaxyMainGame.js` doesn't read the `:id` parameter
- Game loads but has no words/enemies to type = white/empty screen

**Root cause:**
- `GalaxyMainGame.js` doesn't use `useParams` to get challenge ID
- No API call to fetch challenge data using the ID
- No logic to spawn challenge-specific words

---

## Solution

1. Add `useParams` hook to read challenge ID from URL
2. Fetch challenge data from backend API
3. Use challenge words to spawn enemies instead of random words

---

## Tasks

### H1: Add useParams to GalaxyMainGame
**File:** `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

Add import and extract challenge ID:
```javascript
import { useParams } from "react-router-dom";

// In component:
const { id } = useParams();
const [challengeData, setChallengeData] = useState(null);
```

### H2: Fetch Challenge Data
**File:** `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

Add useEffect to fetch challenge when component mounts:
```javascript
useEffect(() => {
  if (id) {
    fetch(`${API_BASE}/api/challenges/${id}`)
      .then(res => res.json())
      .then(data => setChallengeData(data))
      .catch(err => console.error("Failed to load challenge:", err));
  }
}, [id]);
```

Note: Need to check what the backend endpoint returns - might be `/api/challenges/galaxy/{id}` or similar.

### H3: Use Challenge Words
**File:** `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

Modify spawn logic to use challenge words:
- If `challengeData` exists, use words from the challenge
- Otherwise, fall back to default word list (current behavior)

```javascript
// In spawn logic:
const wordList = challengeData?.words || defaultWords;
const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
```

---

## API Endpoint Verification

Check backend to confirm challenge retrieval endpoint:

```bash
# Common patterns:
GET /api/challenges/{id}
GET /api/challenges/galaxy/{id}
GET /api/galaxy-challenges/{id}
```

Update H2 if endpoint differs.

---

## Files Modified

- `frontend/src/pages/GalaxyGame/GalaxyMainGame.js`

---

## Success Criteria

1. Navigating to `/play/galaxy/123` loads that specific challenge
2. Enemies spawn with words from the challenge
3. If no ID in URL, game uses default word list (backwards compatible)
4. Error handling: if challenge not found, show message or fall back
5. Build passes
