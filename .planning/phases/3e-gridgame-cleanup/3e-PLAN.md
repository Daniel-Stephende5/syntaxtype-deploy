# Phase 3e Plan: GridGame Scoring Cleanup

**Phase:** 3e  
**Name:** GridGame Scoring Cleanup  
**Status:** Planning  
**Created:** 2026-03-26

---

## Overview

Fix code review issues identified in PR #5 for the new GridGame. Clean up scoring logic, constants, and React best practices.

---

## Issues Summary

| Priority | Issue | File |
|----------|-------|------|
| HIGH | Magic number `60` hardcoded | GridGame.js |
| HIGH | Inconsistent star awards (some pass 0, some pass 1) | GridGame.js |
| HIGH | Max score mismatch (actual max << 60) | GridGame.js |
| MEDIUM | Inline styles in Completion component | GridGame.js |
| MEDIUM | `next` function has unnecessary dependency | GridGame.js |

---

## Tasks

### HIGH Priority

#### H1: Define Constants for Stars
**File:** `frontend/src/pages/GridGame.js`

Add constants at top of file:
```javascript
const MAX_STAGES = 20;
const MAX_STARS_PER_STAGE = 3;
const MAX_POSSIBLE_STARS = MAX_STAGES * MAX_STARS_PER_STAGE; // 60
const DEFAULT_STARS = 1;
```

Then replace all `60` with `MAX_POSSIBLE_STARS`.

#### H2: Fix Inconsistent Star Awards
**File:** `frontend/src/pages/GridGame.js`

Review all stage components and ensure they pass stars:
- Stages with `useRunner`: Pass `stars` from the hook
- Simple stages: Pass `DEFAULT_STARS` (1)
- S1Watch: Should pass stars (currently 0)

Add consistent logic:
```javascript
onComplete(DEFAULT_STARS)  // For simple stages
onComplete(stars)         // For stages with star calculations
```

#### H3: Update PR Description
Update the PR #5 description to clarify:
- "Score calculation: stars collected × 10 (max 60 points from 20 stages × 3 stars)"
- Accurate max score representation

---

### MEDIUM Priority

#### M1: Move Inline Styles to CSS
**File:** `frontend/src/pages/GridGame.css`

Add new classes:
```css
.completion-score-details {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.completion-stars-count {
  font-weight: 600;
  color: #22c55e;
}

.completion-submit-btn {
  margin-top: 8px;
}
```

**File:** `frontend/src/pages/GridGame.js`

Replace inline styles:
```javascript
// Before:
<div style={{marginTop: 16, fontSize: 14, color: "#666"}}>
  <span style={{fontWeight: 600, color: "#22c55e"}}>{totalStars}</span> stars collected

// After:
<div className="completion-score-details">
  <span className="completion-stars-count">{totalStars}</span> stars collected
```

#### M2: Optimize `next` Function
**File:** `frontend/src/pages/GridGame.js`

Use functional update:
```javascript
// Before:
const next = useCallback((stars = 0) => { 
  handleStageComplete(stars);
  if(stage < STAGES.length - 1) setStage(s => s + 1); else setDone(true); 
}, [stage, handleStageComplete]);

// After:
const next = useCallback((stars = 0) => { 
  handleStageComplete(stars);
  setStage(s => {
    if (s < STAGES.length - 1) {
      return s + 1;
    }
    setDone(true);
    return s;
  });
}, [handleStageComplete]);
```

---

## Execution Order

1. H1 (Constants)
2. H2 (Fix star awards)
3. M2 (Optimize next function)
4. M1 (Move styles to CSS)
5. H3 (Update PR description)

---

## Files Modified

- `frontend/src/pages/GridGame.js`
- `frontend/src/pages/GridGame.css`

---

## Success Criteria

1. `MAX_POSSIBLE_STARS` constant used throughout
2. All stages consistently award stars
3. `next` function uses functional update (no `stage` dependency)
4. Inline styles moved to CSS
5. PR description updated
6. Build passes
