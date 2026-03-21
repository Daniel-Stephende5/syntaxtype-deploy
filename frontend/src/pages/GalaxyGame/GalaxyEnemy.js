// GalaxyEnemy.js
import { getEnemiesByLevel } from "./GalaxyLibrary";

export function spawnEnemy(canvasWidth, enemyData) {
  if (!enemyData) return null;

  return {
    ...enemyData,
    x: canvasWidth + 100,
    y: 0,
    lane: null,
    typed: "",
    shieldIndex: 0,
    answerTyped: "",
    shield: enemyData.type === "shield" && Array.isArray(enemyData.questions) && enemyData.questions.length > 0,
    destroyed: false,
    remove: false,
    speed: enemyData.speed || 150,
  };
}

/**
 * Update position & check if hits player
 */
export function updateEnemies(enemies, dt, canvasWidth, playerPos, onHitPlayer) {
  for (let e of enemies) {
    if (e.remove || e.hitPlayer) continue; // Skip if already exploding

    // --- 1. Movement Logic ---
    e.x -= e.speed * dt;
    // ... (keep your existing tracking/baseY logic here) ...

    // --- 2. Collision Detection (Enemy vs Player Ship) ---
    // We treat the enemy as a small box based on its text position
    const enemyWidth = 60; 
    const enemyHeight = 20;

    const isColliding = (
      e.x < playerPos.x + playerPos.width &&
      e.x + enemyWidth > playerPos.x &&
      e.y < playerPos.y + playerPos.height &&
      e.y + enemyHeight > playerPos.y
    );

    if (isColliding && !e.hitPlayer) {
      e.hitPlayer = true;
      e.collapseTimer = 0;
      onHitPlayer(); // Triggers the ❤️ reduction in MainGame
    }

    // --- 3. Optional: Silent removal if they miss the player ---
    // If they go off-screen without hitting you, they just disappear (no life lost)
    if (e.x < -200) {
      e.remove = true;
    }
  }
  return enemies;
}

/**
 * Render enemies and their words/prompts
 */
export function drawEnemies(ctx, enemies, targetEnemy) {
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  enemies.forEach((e) => {
    if (e.remove) return;

    ctx.save();

    // --- COLLAPSE EFFECT ---
    if (e.hitPlayer) {
      const progress = e.collapseTimer / 0.4;

      // shrink + fade
      const scale = 1 - progress;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.translate(e.x, e.y);
      ctx.scale(scale, scale);
      ctx.translate(-e.x, -e.y);
    }

    // --- TARGET HIGHLIGHT ---
    if (e === targetEnemy && !e.hitPlayer) {
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;

      const textWidth = ctx.measureText(e.word || "SHIELD").width;
      ctx.strokeRect(e.x - 10, e.y - 25, textWidth + 20, 50);

      ctx.fillStyle = "#00ffff";
      ctx.fillText("▶", e.x - 25, e.y);
    }

    // --- SHIELD TYPE ---
    if (e.type === "shield" && e.shield && !e.hitPlayer) {
      const q = e.questions[e.shieldIndex];
      if (!q) {
        e.shield = false;
        ctx.restore();
        return;
      }

      ctx.font = "bold 16px monospace";
      ctx.fillStyle = "#ff4444";
      ctx.fillText(`🛡 ${q.prompt}`, e.x, e.y - 15);

      const display = q.answer
        .split("")
        .map((c, i) => (i < e.answerTyped.length ? c : "_"))
        .join(" ");

      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 20px monospace";
      ctx.fillText(display, e.x, e.y + 15);
    } else {
      // --- NORMAL ENEMY ---
      ctx.font =
        e.type === "boss"
          ? "bold 24px monospace"
          : "bold 18px monospace";

      const typedPart = e.typed || "";
      const remaining = e.word.slice(typedPart.length);

      ctx.fillStyle = "#00ff00";
      ctx.fillText(typedPart, e.x, e.y);

      ctx.fillStyle = e.destroyed ? "#ff0000" : "#ffffff";
      ctx.fillText(
        remaining,
        e.x + ctx.measureText(typedPart).width,
        e.y
      );
    }

    ctx.restore();
  });
}


export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
