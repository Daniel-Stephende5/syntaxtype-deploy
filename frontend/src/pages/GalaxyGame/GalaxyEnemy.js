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
export function handleTyping(enemies, key, targetEnemy) {
  return enemies.map((e) => {
    // Only process the current target
    if (e !== targetEnemy) return e;

    // Shield enemy
    if (e.type === "shield" && e.shield) {
      const q = e.questions[e.shieldIndex];
      if (!q) return e;

      if (q.answer.startsWith(e.answerTyped + key)) {
        const newTyped = e.answerTyped + key;
        if (newTyped === q.answer) {
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
        // Mistyped, reset only this enemy
        return { ...e, answerTyped: "" };
      }
    }

    // Normal enemy
    if (e.word.startsWith(e.typed + key)) {
      const newTyped = e.typed + key;
      if (newTyped === e.word) return { ...e, typed: newTyped, remove: true, destroyed: true };
      return { ...e, typed: newTyped };
    }

    // Mistyped, reset only this enemy
    return { ...e, typed: "" };
  });
}

    // Normal enemy
    if (e.word.toLowerCase().startsWith((e.typed || "") + key.toLowerCase())) {
      const newTyped = (e.typed || "") + key.toLowerCase();
      if (newTyped === e.word.toLowerCase()) {
        return { ...e, typed: newTyped, remove: true, destroyed: true };
      }
      return { ...e, typed: newTyped };
    }

    // Wrong key resets typed letters
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
