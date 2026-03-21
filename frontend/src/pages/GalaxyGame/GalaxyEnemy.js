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
    shield: enemyData.type === "shield",
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
    if (e.remove) continue;

    // --- BASE MOVEMENT ---
    e.x -= e.speed * dt;

    const playerCenterY = playerPos.y + playerPos.height / 2;

    // Store original lane position
    if (e.baseY === undefined) {
      e.baseY = e.y;
    }

    // Distance zones
    const FAR_ZONE = canvasWidth * 0.6;
    const MID_ZONE = canvasWidth * 0.4;

    // Max deviation (prevents stacking)
    const MAX_OFFSET = 30;

    let targetY = e.baseY;

    // MID RANGE tracking
    if (e.x < FAR_ZONE && e.x > MID_ZONE) {
      const diff = playerCenterY - e.baseY;
      const clamped = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, diff));
      targetY = e.baseY + clamped;
    }
    // CLOSE RANGE tracking
    else if (e.x <= MID_ZONE) {
      const diff = playerCenterY - e.baseY;
      const clamped = Math.max(-MAX_OFFSET * 1.5, Math.min(MAX_OFFSET * 1.5, diff));
      targetY = e.baseY + clamped;
    }

    // Smooth movement
    const smoothFactor = 0.08;
    e.y += (targetY - e.y) * smoothFactor;

    // --- BOSS SPECIAL BEHAVIOR ---
    if (e.type === "boss") {
      const bossWave = Math.sin(performance.now() * 0.001) * 25;
      e.y += bossWave * dt;
    }

    // --- COLLISION LEFT WALL ---
    if (e.x < -150 && !e.remove) {
      e.remove = true;
      onHitPlayer();
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

    // --- TARGET HIGHLIGHT ---
    if (e === targetEnemy) {
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;

      const textWidth = ctx.measureText(e.word || "SHIELD").width;
      ctx.strokeRect(e.x - 10, e.y - 25, textWidth + 20, 50);

      ctx.fillStyle = "#00ffff";
      ctx.fillText("▶", e.x - 25, e.y);
    }

    // --- SHIELD TYPE ---
    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return;

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
  });
}

export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
