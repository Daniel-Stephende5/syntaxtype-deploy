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
export function updateEnemies(enemies, dt, canvasWidth, onHitPlayer) {
  return enemies.map((e) => {
    const newX = e.x - e.speed * dt; // move left

    if (newX < -100) {
      onHitPlayer(e);
      return { ...e, remove: true };
    }

    return { ...e, x: newX };
  });
}

// Typing input handling



// Draw enemies
export function drawEnemies(ctx, enemies) {
  enemies.forEach((e) => {
    ctx.font = e.type === "shield" ? "16px monospace" : "18px monospace";

    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return;

      ctx.fillStyle = "red";
      ctx.fillText("🛡 " + q.prompt, e.x, e.y);

      const hidden = q.answer
        .split("")
        .map((c, i) => (i < e.answerTyped.length ? c : "_"))
        .join(" ");

      ctx.fillStyle = "yellow";
      ctx.fillText(hidden, e.x, e.y + 20);
      return;
    }

    // Normal enemy
    const typedPart = e.typed || "";
    const remaining = e.word.slice(typedPart.length);

    ctx.fillStyle = "#0f0";
    ctx.fillText(typedPart, e.x, e.y);

    ctx.fillStyle = "#fff";
    ctx.fillText(remaining, e.x + ctx.measureText(typedPart).width, e.y);
  });
}

// Remove dead enemies
export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
