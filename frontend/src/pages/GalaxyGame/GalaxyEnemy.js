import { getEnemiesByLevel } from "./GalaxyLibrary";

// Spawn enemy from right to left
export function spawnEnemy(canvasWidth, level) {
  const library = getEnemiesByLevel(level);
  const template = library[Math.floor(Math.random() * library.length)];

  return {
    ...template,
    x: canvasWidth + 50,                // start off-screen right
    y: 0,                               // will assign random later
    typed: "",
    shieldIndex: 0,
    answerTyped: "",
    shield: template.type === "shield",
    destroyed: false,
    remove: false,
  };
}

// Update enemies horizontally
export function updateEnemies(enemies, dt, canvasWidth, onHitPlayer) {
  return enemies.map((e) => {
    const newX = e.x - e.speed * dt;

    if (newX < -100) {
      onHitPlayer(e);
      return { ...e, remove: true };
    }

    return { ...e, x: newX };
  });
}

// Typing handler (per-character)
export function handleTyping(enemies, key) {
  return enemies.map((e) => {
    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return e;

      if (q.answer.startsWith(e.answerTyped + key)) {
        e.answerTyped += key;
        if (e.answerTyped === q.answer) {
          e.shieldIndex++;
          e.answerTyped = "";
          if (e.shieldIndex >= e.questions.length) e.shield = false;
        }
      } else {
        e.answerTyped = "";
      }
      return e;
    }

    if (e.word.toLowerCase().startsWith(e.typed + key)) {
      e.typed += key;
      if (e.typed === e.word) {
        e.destroyed = true;
        e.remove = true;
      }
    } else {
      e.typed = "";
    }

    return e;
  });
}

// Draw enemies and highlight target
export function drawEnemies(ctx, enemies, targetEnemy = null) {
  enemies.forEach((e) => {
    // Highlight target enemy
    if (e === targetEnemy) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x - 5, e.y - 5, 100 + 10, 20 + 10); // box around text
    }

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

// Cleanup
export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
