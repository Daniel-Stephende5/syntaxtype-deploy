// GalaxyEnemy.js
import { getEnemiesByLevel } from "./GalaxyLibrary";

export function spawnEnemy(canvasWidth, currentTime) {
  const library = getEnemiesByLevel(currentTime);
  if (!library || library.length === 0) return null;

  const template = library[Math.floor(Math.random() * library.length)];

  return {
    ...template,
    x: canvasWidth + 100,           // Start further offscreen for smoother entry
    y: 0,                           // Set by the lane system in GalaxyMainGame
    lane: null,                     // Tracked for spawning logic
    typed: "",
    shieldIndex: 0,
    answerTyped: "",
    shield: template.type === "shield",
    destroyed: false,
    remove: false,
    speed: template.speed || 150,   // Fallback speed
  };
}

/**
 * Update position & check if hits player
 */
// Update position & check if hits player
export function updateEnemies(enemies, dt, canvasWidth, playerPos, onHitPlayer) {
  for (let e of enemies) {
    if (e.remove) continue;

    // 1. Move Left (Constant)
    e.x -= e.speed * dt;

    // 2. Conditional Gravitation (The "Danger Zone" Logic)
    // Only start creeping vertically when the enemy is close to the player
    const DANGER_ZONE = canvasWidth * 0.4; // e.g., only when in the left 40% of the screen
    
    if (!e.destroyed && e.x < DANGER_ZONE) {
      const creepSpeed = 80; // Faster creep since they have less time to move
      const targetY = playerPos.y + (playerPos.height / 2);
      const diffY = targetY - e.y;

      if (Math.abs(diffY) > 5) {
        e.y += (diffY > 0 ? 1 : -1) * creepSpeed * dt;
      }
    }

    // 3. Collision with left wall
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
