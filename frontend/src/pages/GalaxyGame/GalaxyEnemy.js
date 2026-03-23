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
    shield: Array.isArray(enemyData.questions) && enemyData.questions.length > 0,
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
  const lineHeight = 28; // Space between lines
  const lines = e.word.split("\n");
  let globalCharsCount = 0;

  lines.forEach((lineText, index) => {
    const yOffset = e.y + (index * lineHeight);
    const typedInThisLine = Math.max(0, Math.min(lineText.length, (e.typed || "").length - globalCharsCount));
    
    const partDone = lineText.slice(0, typedInThisLine);
    const partLeft = lineText.slice(typedInThisLine);

    // 1. Draw Typed Part (Green)
    ctx.fillStyle = "#00ff00";
    ctx.fillText(partDone, e.x, yOffset);

    // 2. Draw Remaining Part (White/Red)
    ctx.fillStyle = e.destroyed ? "#ff0000" : "#ffffff";
    const xOffset = ctx.measureText(partDone).width;
    ctx.fillText(partLeft, e.x + xOffset, yOffset);

    // Update counter (+1 for the \n we split on)
    globalCharsCount += lineText.length + 1; 
  });
} else {
  // ... (Your existing standard enemy drawing logic)
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

    // --- 1. SHIELD PHASE (Prioritize this!) ---
    if (e.shield && e.questions && e.questions[e.shieldIndex]) {
      const q = e.questions[e.shieldIndex];
      
      // Draw the Question Prompt
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = "#ff4444"; 
      ctx.fillText(`🛡️ QUESTION: ${q.prompt}`, e.x, e.y - 30);

      // Draw the Answer Progress (Visualizing typed vs remaining)
      const answer = q.answer;
      const typedPart = e.answerTyped || "";
      const remaining = answer.slice(typedPart.length);

      ctx.font = "bold 24px monospace";
      ctx.fillStyle = "#00ff00"; // Green for correct answer letters
      ctx.fillText(typedPart, e.x, e.y + 10);

      ctx.fillStyle = "#ffff00"; // Yellow for remaining answer letters
      ctx.fillText("_ ".repeat(remaining.length), e.x + ctx.measureText(typedPart).width, e.y + 10);
      
      // Draw a "Shield Bubble" around the enemy text area
      ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(e.x - 15, e.y - 50, 300, 100);
    } 
    // --- 2. WORD PHASE (Only shows after shield is gone) ---
   else {
  const isBoss = e.type === "boss" || (e.questions && e.questions.length > 2);

  const typedPart = e.typed || "";

  // =========================
  // 🔥 BOSS (MULTI-LINE)
  // =========================
  if (isBoss) {
    ctx.font = "bold 24px monospace";

    const fullText = e.word;
    const typedLength = typedPart.length;

    const typedText = fullText.slice(0, typedLength);
    const remainingText = fullText.slice(typedLength);

    const typedLines = typedText.split("\n");
    const remainingLines = remainingText.split("\n");

    const lineHeight = 26;

    for (let i = 0; i < Math.max(typedLines.length, remainingLines.length); i++) {
      const typedLine = typedLines[i] || "";
      const remainingLine = remainingLines[i] || "";

      const yOffset = e.y + i * lineHeight;

      // typed part (green)
      ctx.fillStyle = "#00ff00";
      ctx.fillText(typedLine, e.x, yOffset);

      // remaining part (white)
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        remainingLine,
        e.x + ctx.measureText(typedLine).width,
        yOffset
      );
    }
  }

  // =========================
  // 🟢 NORMAL ENEMIES
  // =========================
  else {
    ctx.font = "bold 18px monospace";

    const remaining = e.word.slice(typedPart.length);

    ctx.fillStyle = "#00ff00";
    ctx.fillText(typedPart, e.x, e.y);

    ctx.fillStyle = e.destroyed ? "#ff0000" : "#ffffff";
    ctx.fillText(remaining, e.x + ctx.measureText(typedPart).width, e.y);
  }
}
    // --- 3. TARGETING BRACKETS ---
    if (e === targetEnemy && !e.destroyed) {
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x - 10, e.y - 45, 350, 90);
    }
  });
}

export function cleanupEnemies(enemies) {
  return enemies.filter((e) => !e.remove);
}
