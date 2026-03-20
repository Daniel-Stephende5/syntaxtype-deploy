// GalaxyEnemy.js
import { getEnemiesByLevel } from "./GalaxyLibrary";

export function spawnEnemy(canvasWidth, currentTime) {
  const library = getEnemiesByLevel(currentTime);
  if (library.length === 0) return null;

  const template = library[Math.floor(Math.random() * library.length)];

  return {
    ...template,
    x: canvasWidth + 50,           // start offscreen right
    y: 0,                          // will randomize in loop
    typed: "",
    shieldIndex: 0,
    answerTyped: "",
    shield: template.type === "shield",
    destroyed: false,
    remove: false,
  };
}

// Update position & check if hits player
export function updateEnemies(enemies, dt, canvasWidth, playerPos, onHitPlayer) {
  for (let e of enemies) {
    // 1. Move Left
    e.x -= e.speed * dt;

    // 2. The Slow Creep (Gravitation)
    if (!e.destroyed) {
      const creepSpeed = 30; // Slow vertical drift
      const targetY = playerPos.y + 10; // Aim for the middle of the ship
      const diffY = targetY - e.y;

      // Only move if the enemy is more than 5 pixels away (prevents jitter)
      if (Math.abs(diffY) > 5) {
        e.y += (diffY > 0 ? 1 : -1) * creepSpeed * dt;
      }
    }

    // 3. Collision with left wall
    if (e.x < -100 && !e.remove) {
      e.remove = true;
      onHitPlayer(e);
    }
  }
  return enemies;
}

export function drawEnemies(ctx, enemies, targetEnemy) {
  enemies.forEach((e) => {
    // Optional: Highlight the target so you know who you are typing at
    if (e === targetEnemy) {
      ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x - 5, e.y - 20, ctx.measureText(e.word || "shield").width + 10, 30);
    }

    ctx.font = e.type === "shield" ? "bold 16px monospace" : "bold 18px monospace";

    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return;

      ctx.fillStyle = "#ff4444";
      ctx.fillText("🛡 " + q.prompt, e.x, e.y);

      const display = q.answer
        .split("")
        .map((c, i) => (i < e.answerTyped.length ? c : "_"))
        .join(" ");

      ctx.fillStyle = "#ffff00";
      ctx.fillText(display, e.x, e.y + 20);
    } else {
      const typedPart = e.typed || "";
      const remaining = e.word.slice(typedPart.length);

      ctx.fillStyle = "#00ff00"; // Green for correct letters
      ctx.fillText(typedPart, e.x, e.y);

      ctx.fillStyle = "#ffffff"; // White for the rest
      ctx.fillText(remaining, e.x + ctx.measureText(typedPart).width, e.y);
    }
  });
}

// Remove dead enemies
export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
