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
// Update position & check if hits player
export function updateEnemies(enemies, dt, canvasWidth, playerPos, onHitPlayer) {
  for (let e of enemies) {
    if (e.remove) continue;

    // --- BASE MOVEMENT ---
    e.x -= e.speed * dt;

   export function updateEnemies(enemies, dt, canvasWidth, playerPos, onHitPlayer) {
  for (let e of enemies) {
    if (e.remove) continue;

    // --- BASE MOVEMENT ---
    e.x -= e.speed * dt;

    const playerCenterY = playerPos.y + playerPos.height / 2;

    // DISTANCE ZONES
    const FAR_ZONE = canvasWidth * 0.6;
    const MID_ZONE = canvasWidth * 0.4;
    const CLOSE_ZONE = canvasWidth * 0.25;

    // --- 1. FAR ZONE → Stay in lane but slight drift (alive feeling) ---
    if (e.x > FAR_ZONE) {
      if (!e.baseY) e.baseY = e.y;

      const wave = Math.sin(performance.now() * 0.002 + e.x * 0.01) * 10;
      e.y = e.baseY + wave;
    }

    // --- 2. MID ZONE → Smooth tracking (not snapping) ---
    else if (e.x > MID_ZONE) {
      const trackingSpeed = 60;

      const targetY = playerCenterY;
      const diff = targetY - e.y;

      e.y += diff * 0.05 * dt * trackingSpeed;
    }

    // --- 3. CLOSE ZONE → Aggressive attack movement ---
    else if (e.x > CLOSE_ZONE) {
      const attackSpeed = 140;

      const diff = playerCenterY - e.y;

      e.y += Math.sign(diff) * attackSpeed * dt;
    }

    // --- 4. VERY CLOSE → Lock-in (feels threatening) ---
    else {
      const lockSpeed = 200;

      const diff = playerCenterY - e.y;
      e.y += diff * 0.15 * dt * lockSpeed;
    }

    // --- BOSS SPECIAL BEHAVIOR ---
    if (e.type === "boss") {
      // Bosses sway wider + slower but more deliberate
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

    // --- BOSS SPECIAL BEHAVIOR ---
    if (e.type === "boss") {
      // Bosses sway wider + slower but more deliberate
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

    // --- 1. TARGET HIGHLIGHT ---
    if (e === targetEnemy) {
      // Draw a subtle "Targeting" bracket or glow
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      const textWidth = ctx.measureText(e.word || "SHIELD").width;
      ctx.strokeRect(e.x - 10, e.y - 25, textWidth + 20, 50);
      
      // Target Arrow
      ctx.fillStyle = "#00ffff";
      ctx.fillText("▶", e.x - 25, e.y);
    }

    // --- 2. DRAW WORD / PROMPT ---
    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return;

      // Draw Shield Prompt (The Question)
      ctx.font = "bold 16px monospace";
      ctx.fillStyle = "#ff4444";
      ctx.fillText(`🛡 ${q.prompt}`, e.x, e.y - 15);

      // Draw Shield Answer (The Progress)
      const display = q.answer
        .split("")
        .map((c, i) => (i < e.answerTyped.length ? c : "_"))
        .join(" ");

      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 20px monospace";
      ctx.fillText(display, e.x, e.y + 15);
    } else {
      // Normal Word logic
      ctx.font = e.type === "boss" ? "bold 24px monospace" : "bold 18px monospace";
      
      const typedPart = e.typed || "";
      const remaining = e.word.slice(typedPart.length);

      // Visual feedback for typed letters
      ctx.fillStyle = "#00ff00"; // Green for correctly typed
      ctx.fillText(typedPart, e.x, e.y);

      ctx.fillStyle = e.destroyed ? "#ff0000" : "#ffffff"; // Red if exploding, White otherwise
      ctx.fillText(remaining, e.x + ctx.measureText(typedPart).width, e.y);
    }
  });
}

export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
