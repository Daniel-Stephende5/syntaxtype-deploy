// GalaxyEnemy.js
import { getEnemiesByLevel } from "./GalaxyLibrary";

export function spawnEnemy(canvasWidth, level) {
  const library = getEnemiesByLevel(level);
  const template = library[Math.floor(Math.random() * library.length)];

  return {
    ...template,
    x: canvasWidth + 50,           // start right offscreen
    y: Math.random() * (500 - 50), // adjust to canvas height dynamically
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
export function handleTyping(enemies, key) {
  return enemies.map((e) => {
    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return e; // all shields cleared

      if (q.answer.startsWith(e.answerTyped + key)) {
        const newTyped = e.answerTyped + key;

        if (newTyped === q.answer) {
          // shield cleared, go to next
          const nextShield = e.shieldIndex + 1;
          return {
            ...e,
            shieldIndex: nextShield,
            answerTyped: "",
            shield: nextShield < e.questions.length,
          };
        }

        return { ...e, answerTyped: newTyped };
      } else {
        return { ...e, answerTyped: "" };
      }
    }

    // Normal typing enemy
    if (e.word.startsWith(e.typed + key)) {
      const newTyped = e.typed + key;
      if (newTyped === e.word) return { ...e, typed: newTyped, remove: true, destroyed: true };
      return { ...e, typed: newTyped };
    }

    return { ...e, typed: "" };
  });
}

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

    const typedPart = e.typed;
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
