import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import {
  spawnEnemy,
  updateEnemies,
  drawEnemies,
  cleanupEnemies,
} from "./GalaxyEnemy";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const assetsRef = useRef({ ship: null });

  const [gameReady, setGameReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const playerRef = useRef({ x: 50, y: 0, width: 80, height: 60, speed: 450 });
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({});

  const { initStars, drawBackground } = useBackground();

  // -------------------------
  // SCORE & PLAYER HIT
  // -------------------------
  const addScore = (enemy) => {
    const pts = enemy.type === "boss" ? 10 : enemy.type === "shield" ? 2 : 1;
    setScore((s) => s + pts);
  };

  const handlePlayerHit = () => {
    setLives((prev) => {
      if (prev <= 1) setGameOver(true);
      return prev - 1;
    });
  };

  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width,
      y: p.y + p.height / 2,
      target,
      speed: 1100,
    });
  };

  // -------------------------
  // CONTROLS
  // -------------------------
  useEffect(() => {
    // Reset body margin to prevent canvas overlap
    document.body.style.margin = "0";

    const handleKeyDown = (e) => {
      if (isPaused || gameOver) return;
      const key = e.key;

      // Movement & TAB target switch
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
        e.preventDefault();
        if (key === "Tab") {
          const aliveEnemies = enemiesRef.current.filter((en) => !en.destroyed && !en.remove);
          if (aliveEnemies.length === 0) return;
          const idx = aliveEnemies.indexOf(targetEnemyRef.current);
          targetEnemyRef.current = aliveEnemies[(idx + 1) % aliveEnemies.length];
        } else {
          keysPressed.current[key] = true;
        }
        return;
      }

      // Typing logic
      if (key.length === 1) {
        const char = key.toLowerCase();

        // Auto-acquire target if none
        if (!targetEnemyRef.current || targetEnemyRef.current.remove) {
          const match = enemiesRef.current.find((en) => {
            if (en.destroyed || en.remove) return false;
            const toCheck = en.type === "shield" && en.shield
              ? en.questions[en.shieldIndex].answer
              : en.word;
            return toCheck.toLowerCase().startsWith(char);
          });
          if (!match) return;
          targetEnemyRef.current = match;
        }

        const target = targetEnemyRef.current;

        if (!target || target.remove || target.destroyed) {
          targetEnemyRef.current = null;
          return;
        }

        // Shielded enemy
        if (target.type === "shield" && target.shield) {
          const q = target.questions[target.shieldIndex];
          const expectedChar = q.answer[target.answerTyped.length]?.toLowerCase();

          if (char === expectedChar) {
            target.answerTyped += key;
            shootBullet(target);

            if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              target.shieldIndex++;
              target.answerTyped = "";
              if (target.shieldIndex >= target.questions.length) target.shield = false;
            }
          }
        } 
        // Normal / Boss enemy
        else {
          const nextIdx = (target.typed || "").length;
          const expectedChar = target.word[nextIdx]?.toLowerCase();

          if (char === expectedChar) {
            target.typed = (target.typed || "") + key;
            shootBullet(target);

            // Word complete
            if (target.typed.toLowerCase() === target.word.toLowerCase()) {
              addScore(target);
              target.destroyed = true;

              // Smooth removal after bullets reach target
              setTimeout(() => {
                target.remove = true;
              }, 300);

              targetEnemyRef.current = null; // unlock next target
            }
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused, gameOver]);

  // -------------------------
  // MAIN LOOP
  // -------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas, 150);
      playerRef.current.y = canvas.height / 2;
    };
    window.addEventListener("resize", resize);
    resize();

    // Load ship asset
    loadAssets({ images: { ship: "/images/nightraider.png" } })
      .then((loaded) => { assetsRef.current = loaded; })
      .catch(() => console.error("Asset load failed"))
      .finally(() => setGameReady(true));

    let last = performance.now();

    function loop(now) {
      if (gameOver) return;
      const dt = (now - last) / 1000;
      last = now;

      const p = playerRef.current;
      if (!isPaused && gameReady) {
        const keys = keysPressed.current;

        // Player movement
        if (keys["ArrowLeft"]) p.x -= p.speed * dt;
        if (keys["ArrowRight"]) p.x += p.speed * dt;
        if (keys["ArrowUp"]) p.y -= p.speed * dt;
        if (keys["ArrowDown"]) p.y += p.speed * dt;

        // Clamp player
        p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));

        // Enemy spawn
        spawnTimerRef.current += dt;
        if (spawnTimerRef.current > 1.8) {
          spawnTimerRef.current = 0;
        const en = spawnEnemy(canvas.width, now);
if (en) {
  const padding = 60; // space between enemies
  const maxAttempts = 10;
  let attempt = 0;
  let yPos;

  do {
    yPos = 60 + Math.random() * (canvas.height - 160); // avoid UI at top & bottom
    attempt++;
  } while (
    enemiesRef.current.some(other => !other.remove && Math.abs(other.y - yPos) < padding) &&
    attempt < maxAttempts
  );

  en.y = yPos;
  enemiesRef.current.push(en);
}
        }

        // Update enemies & collisions
        updateEnemies(enemiesRef.current, dt, canvas.width, p, handlePlayerHit);
        enemiesRef.current.forEach((en) => {
          if (!en.remove && !en.destroyed && Math.abs(en.x - p.x) < 60 && Math.abs(en.y - p.y) < 40) {
            en.remove = true; handlePlayerHit();
          }
        });
        enemiesRef.current = cleanupEnemies(enemiesRef.current);

        // Bullet movement
        bulletsRef.current = bulletsRef.current.filter((b) => {
          if (!b.target || b.target.remove) return false;
          const dx = b.target.x - b.x;
          const dy = b.target.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) return false;
          b.x += (dx / dist) * b.speed * dt;
          b.y += (dy / dist) * b.speed * dt;
          return true;
        });
      }

      // Draw background & enemies
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);

      // Draw bullets
      ctx.fillStyle = "#00ffff";
      bulletsRef.current.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player ship
      if (assetsRef.current.ship) {
        ctx.drawImage(assetsRef.current.ship, p.x, p.y, p.width, p.height);
      } else {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "blue";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, gameOver, gameReady, initStars, drawBackground]);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div style={{ position: "fixed", inset: 0, background: "black", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, display: "block" }}
      />

      {/* UI */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: "0 50px",
        pointerEvents: "none",
        zIndex: 100
      }}>
        <div style={{ color: "white", fontSize: "32px", fontFamily: "monospace", textShadow: "2px 2px #000" }}>
          SCORE: {score}
        </div>
        <div style={{ color: "white", fontSize: "32px", fontFamily: "monospace", textShadow: "2px 2px #000" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.2, marginLeft: "10px" }}>❤️</span>
          ))}
        </div>
      </div>

      {gameOver && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          color: "white"
        }}>
          <h1 style={{ fontSize: "5rem", color: "#ff4444" }}>GAME OVER</h1>
          <p style={{ fontSize: "2rem" }}>SCORE: {score}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "15px 40px", fontSize: "1.5rem", cursor: "pointer", background: "white", border: "none", borderRadius: "8px" }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
