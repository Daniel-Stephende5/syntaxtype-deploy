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
    hitPlayer: false,     // Flag for collision
    collapseTimer: 0,    // Timer for disappearing animation
    speed: enemyData.speed || 150,
  };
}

export function updateEnemies(enemies, dt, canvasWidth, playerPos, onHitPlayer) {
  for (let e of enemies) {
    if (e.remove) continue;

    // --- 1. COLLAPSE STATE (After hitting player) ---
    if (e.hitPlayer) {
      e.collapseTimer += dt;
      // Fade/Shrink for 0.4s then remove
      if (e.collapseTimer > 0.4) {
        e.remove = true;
      }
      continue; // Stop normal movement and logic for this enemy
    }

    // --- 2. NORMAL MOVEMENT ---
    e.x -= e.speed * dt;

    const playerCenterY = playerPos.y + playerPos.height / 2;
    if (e.baseY === undefined) e.baseY = e.y;

    // Tracking logic (Danger Zone)
    const FAR_ZONE = canvasWidth * 0.6;
    const MID_ZONE = canvasWidth * 0.4;
    const MAX_OFFSET = 30;
    let targetY = e.baseY;

    if (e.x < FAR_ZONE && e.x > MID_ZONE) {
      const diff = playerCenterY - e.baseY;
      targetY = e.baseY + Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, diff));
    } else if (e.x <= MID_ZONE) {
      const diff = playerCenterY - e.baseY;
      targetY = e.baseY + Math.max(-MAX_OFFSET * 1.5, Math.min(MAX_OFFSET * 1.5, diff));
    }

    const smoothFactor = 0.08;
    e.y += (targetY - e.y) * smoothFactor;

    if (e.type === "boss") {
      e.y += Math.sin(performance.now() * 0.001) * 25 * dt;
    }

    // --- 3. COLLISION DETECTION (Ship vs Enemy) ---
    // Using a slightly smaller hitbox for the ship to feel "fairer"
    const shipBox = {
      left: playerPos.x + 10,
      right: playerPos.x + playerPos.width - 10,
      top: playerPos.y + 10,
      bottom: playerPos.y + playerPos.height - 10
    };

    // Assuming text height is ~20px and width is roughly proportional to word length
    const enemyWidth = (e.word ? e.word.length * 10 : 60); 

    const isTouching = (
      e.x < shipBox.right &&
      e.x + enemyWidth > shipBox.left &&
      e.y < shipBox.bottom &&
      e.y + 10 > shipBox.top
    );

    if (isTouching && !e.hitPlayer && !e.destroyed) {
      e.hitPlayer = true;
      e.collapseTimer = 0;
      onHitPlayer(); // Subtract a life
    }

    // --- 4. CLEANUP (If they miss the player entirely) ---
    if (e.x < -200) {
      e.remove = true;
    }
  }
  return enemies;
}

export function drawEnemies(ctx, enemies, targetEnemy) {
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  enemies.forEach((e) => {
    if (e.remove) return;

    ctx.save();

    // --- COLLAPSE VISUALS ---
    if (e.hitPlayer) {
      const progress = Math.min(e.collapseTimer / 0.4, 1);
      ctx.globalAlpha = 1 - progress;
      ctx.translate(e.x, e.y);
      ctx.scale(1 - progress, 1 - progress);
      ctx.translate(-e.x, -e.y);
    }

    // --- TARGETING INDICATOR ---
    if (e === targetEnemy && !e.hitPlayer && !e.destroyed) {
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      const textWidth = ctx.measureText(e.word || "SHIELD").width;
      ctx.strokeRect(e.x - 10, e.y - 25, textWidth + 20, 50);
      ctx.fillStyle = "#00ffff";
      ctx.fillText("▶", e.x - 25, e.y);
    }

    // --- RENDERING TEXT ---
    if (e.type === "shield" && e.shield && !e.hitPlayer) {
      const q = e.questions[e.shieldIndex];
      if (!q) { e.shield = false; ctx.restore(); return; }

      ctx.font = "bold 16px monospace";
      ctx.fillStyle = "#ff4444";
      ctx.fillText(`🛡 ${q.prompt}`, e.x, e.y - 15);

      const display = q.answer.split("").map((c, i) => (i < e.answerTyped.length ? c : "_")).join(" ");
      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 20px monospace";
      ctx.fillText(display, e.x, e.y + 15);
    } else {
      ctx.font = e.type === "boss" ? "bold 24px monospace" : "bold 18px monospace";
      const typedPart = e.typed || "";
      const remaining = e.word.slice(typedPart.length);

      ctx.fillStyle = "#00ff00"; // Typed
      ctx.fillText(typedPart, e.x, e.y);
      ctx.fillStyle = e.destroyed ? "#ff0000" : "#ffffff"; // Remaining
      ctx.fillText(remaining, e.x + ctx.measureText(typedPart).width, e.y);
    }

    ctx.restore();
  });
}

export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
