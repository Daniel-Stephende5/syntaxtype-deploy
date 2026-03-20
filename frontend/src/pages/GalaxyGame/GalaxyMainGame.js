import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import { spawnEnemy, updateEnemies, drawEnemies, cleanupEnemies } from "./GalaxyEnemy";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const assetsRef = useRef(null);

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

  // --- GAME LOGIC ---
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

  // --- CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || gameOver) return;
      const key = e.key;

      // Movement
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault();
        keysPressed.current[key] = true;
        return;
      }

      // TAB target switch
      if (key === "Tab") {
        e.preventDefault();
        const alive = enemiesRef.current.filter(en => !en.remove && !en.destroyed);
        if (alive.length === 0) return;

        const idx = alive.indexOf(targetEnemyRef.current);
        targetEnemyRef.current = alive[(idx + 1) % alive.length];
        return;
      }

      // Typing
      if (key.length === 1) {
        const char = key.toLowerCase();

        // Only acquire target if NONE exists
        if (!targetEnemyRef.current) {
          const match = enemiesRef.current.find(en => {
            if (en.remove || en.destroyed) return false;

            const word = en.type === "shield" && en.shield
              ? en.questions[en.shieldIndex].answer
              : en.word;

            return word.toLowerCase().startsWith(char);
          });

          if (!match) return;
          targetEnemyRef.current = match;
        }

        const target = targetEnemyRef.current;

        if (!target || target.remove || target.destroyed) {
          targetEnemyRef.current = null;
          return;
        }

        // SHIELD ENEMY
        if (target.type === "shield" && target.shield) {
          const q = target.questions[target.shieldIndex];
          const expected = q.answer[target.answerTyped.length]?.toLowerCase();

          if (char === expected) {
            target.answerTyped += key;
            shootBullet(target);

            if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              target.shieldIndex++;
              target.answerTyped = "";

              if (target.shieldIndex >= target.questions.length) {
                target.shield = false;
              }
            }
          }
        }

        // NORMAL ENEMY
        else {
          const nextIdx = (target.typed || "").length;
          const expected = target.word[nextIdx]?.toLowerCase();

          if (char === expected) {
            target.typed = (target.typed || "") + key;
            shootBullet(target);

            if (target.typed.toLowerCase() === target.word.toLowerCase()) {
              addScore(target);

              target.destroyed = true;

              // Smooth removal
              setTimeout(() => {
                target.remove = true;
              }, 120);

              // 🔥 instantly pick next target (NO PAUSE)
              const nextTarget = enemiesRef.current.find(en =>
                !en.remove && !en.destroyed && en !== target
              );

              targetEnemyRef.current = nextTarget || null;
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

  // --- MAIN LOOP ---
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

    // LOAD ASSETS
    loadAssets({
      images: { ship: "/images/nightraider.png?v=" + Date.now() }
    })
      .then((loaded) => {
        console.log("ASSETS:", loaded);
        assetsRef.current = loaded;
      })
      .catch((err) => console.error("Asset failed:", err))
      .finally(() => setGameReady(true));

    let last = performance.now();

    const loop = (now) => {
      if (gameOver) return;

      const dt = (now - last) / 1000;
      last = now;

      if (!isPaused && gameReady) {
        const p = playerRef.current;
        const keys = keysPressed.current;

        if (keys["ArrowLeft"]) p.x -= p.speed * dt;
        if (keys["ArrowRight"]) p.x += p.speed * dt;
        if (keys["ArrowUp"]) p.y -= p.speed * dt;
        if (keys["ArrowDown"]) p.y += p.speed * dt;

        p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));

        // Spawn enemies
        spawnTimerRef.current += dt;
        if (spawnTimerRef.current > 1.8) {
          spawnTimerRef.current = 0;
          const en = spawnEnemy(canvas.width, now);
          if (en) {
            en.y = Math.random() * (canvas.height - 100);
            enemiesRef.current.push(en);
          }
        }

        updateEnemies(enemiesRef.current, dt, canvas.width, p, handlePlayerHit);

        // Collisions
        enemiesRef.current.forEach(en => {
          if (!en.remove && !en.destroyed &&
              Math.abs(en.x - p.x) < 60 &&
              Math.abs(en.y - p.y) < 40) {
            en.remove = true;
            handlePlayerHit();
          }
        });

        enemiesRef.current = cleanupEnemies(enemiesRef.current);

        // Bullets
        bulletsRef.current = bulletsRef.current.filter(b => {
          if (!b.target || b.target.remove || b.target.destroyed) return false;

          const dx = b.target.x - b.x;
          const dy = b.target.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 20) return false;

          b.x += (dx / dist) * b.speed * dt;
          b.y += (dy / dist) * b.speed * dt;

          return true;
        });
      }

      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);

      // Bullets
      ctx.fillStyle = "#00ffff";
      bulletsRef.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ship
      const p = playerRef.current;
      if (assetsRef.current?.ship) {
        ctx.drawImage(assetsRef.current.ship, p.x, p.y, p.width, p.height);
      } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, gameOver, gameReady, initStars, drawBackground]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "black" }}>
      <canvas ref={canvasRef} />

      {/* UI */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 50px",
        zIndex: 9999,
        pointerEvents: "none"
      }}>
        <div style={{
          color: "#fff",
          fontSize: "32px",
          fontFamily: "monospace",
          textShadow: "0 0 10px black"
        }}>
          SCORE: {score}
        </div>

        <div style={{
          color: "#fff",
          fontSize: "32px",
          fontFamily: "monospace",
          textShadow: "0 0 10px black"
        }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.2, marginLeft: 10 }}>
              ❤️
            </span>
          ))}
        </div>
      </div>

      {gameOver && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          color: "white"
        }}>
          <h1 style={{ fontSize: "5rem", color: "#ff4444" }}>GAME OVER</h1>
          <p style={{ fontSize: "2rem" }}>SCORE: {score}</p>
          <button onClick={() => window.location.reload()}>
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
