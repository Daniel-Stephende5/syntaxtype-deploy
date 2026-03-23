import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import { getEnemiesByLevel } from "./GalaxyLibrary";
import { spawnEnemy, updateEnemies, drawEnemies, cleanupEnemies } from "./GalaxyEnemy";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const assetsRef = useRef({ ship: null });
  const gameTimeRef = useRef(0);
  const difficultyRef = useRef(1);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const [gameReady, setGameReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const playerRef = useRef({ x: 50, y: 300, width: 80, height: 60, speed: 500 });
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(-1.5);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({});

  const { initStars, drawBackground } = useBackground();

  // UI helpers
  const updateScoreUI = (pts) => {
    scoreRef.current += pts;
    const scoreEl = document.getElementById("ui-score");
    if (scoreEl) scoreEl.innerText = `SCORE: ${scoreRef.current}`;
  };

  const updateLivesUI = () => {
    livesRef.current -= 1;
    const livesEl = document.getElementById("ui-lives");
    if (livesEl) {
      let hearts = "";
      for (let i = 0; i < 3; i++) {
        hearts += i < livesRef.current ? "❤️ " : "🖤 ";
      }
      livesEl.innerText = hearts;
    }
    if (livesRef.current <= 0) setGameOver(true);
  };

  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width,
      y: p.y + p.height / 2,
      target,
      speed: 1400,
    });
  };

  // Load assets
  useEffect(() => {
    loadAssets({ images: { ship: "/images/nightraider.png" } })
      .then((loaded) => {
        assetsRef.current = loaded;
        setGameReady(true);
      })
      .catch((err) => console.error("Asset load failed", err));
  }, []);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || gameOver) return;
      let key = e.key;

      // Arrow keys & Tab (target cycling)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
        e.preventDefault();
        if (key === "Tab") {
          const aliveEnemies = enemiesRef.current.filter((en) => !en.destroyed && !en.remove);
          if (!aliveEnemies.length) return;
          const idx = aliveEnemies.indexOf(targetEnemyRef.current);
          targetEnemyRef.current = aliveEnemies[(idx + 1) % aliveEnemies.length];
        } else {
          keysPressed.current[key] = true;
        }
        return;
      }

      // --- Typing Logic ---
      const target = targetEnemyRef.current;
      if (!target || target.remove || target.destroyed) return;

      // Boss-only Enter support
      let char = key;
      if (target.type === "boss" && key === "Enter") {
        char = "\n";
      } else if (key.length !== 1) {
        return; // ignore other keys
      }

      char = char.toLowerCase();

      // --- Shield Enemy Logic ---
      if (target.shield) {
        const q = target.questions[target.shieldIndex];
        const expectedChar = q.answer[target.answerTyped.length]?.toLowerCase();
        if (char === expectedChar) {
          target.answerTyped += key;
          shootBullet(target);
          if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
            target.shieldIndex++;
            target.answerTyped = "";
            if (target.shieldIndex >= target.questions.length) {
              target.shield = false;
              target.typed = "";
            }
          }
        }
      } else {
        // --- Standard Enemy / Boss Logic ---
        const nextIdx = (target.typed || "").length;
        const expectedChar = target.word[nextIdx]?.toLowerCase();

        if (char === expectedChar) {
          target.typed = (target.typed || "") + (key === "Enter" ? "\n" : key);
          shootBullet(target);

          if (target.typed.toLowerCase() === target.word.toLowerCase()) {
            const pts = target.type === "boss" ? 10 : target.type === "shield" ? 2 : 1;
            updateScoreUI(pts);
            target.destroyed = true;
            setTimeout(() => { target.remove = true; }, 100);
            targetEnemyRef.current = null;
          }
        }
      }
    };

    const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused, gameOver]);

  // Main game loop
  useEffect(() => {
    if (!gameReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let PLAY_AREA_BOTTOM = window.innerHeight - 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      PLAY_AREA_BOTTOM = canvas.height - 60;
      initStars(canvas, 150);
    };
    window.addEventListener("resize", resize);
    resize();

    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (!isPaused && !gameOver) {
        gameTimeRef.current += dt;

        // Difficulty scaling
        const currentLevel = Math.floor(gameTimeRef.current / 60) + 1;
        if (currentLevel > difficultyRef.current) difficultyRef.current = currentLevel;

        const maxEnemiesOnScreen = 5 + Math.floor(gameTimeRef.current / 60) * 2;

        const p = playerRef.current;
        const keys = keysPressed.current;

        // Player movement
        if (keys["ArrowLeft"]) p.x -= p.speed * dt;
        if (keys["ArrowRight"]) p.x += p.speed * dt;
        if (keys["ArrowUp"]) p.y -= p.speed * dt;
        if (keys["ArrowDown"]) p.y += p.speed * dt;

        p.x = Math.max(10, Math.min(canvas.width - p.width - 10, p.x));
        p.y = Math.max(90, Math.min(canvas.height - 120, p.y));

        // Spawn enemies
        spawnTimerRef.current += dt;
        const activeEnemyCount = enemiesRef.current.filter(en => !en.remove && !en.destroyed).length;

        if (spawnTimerRef.current > 1.8 && activeEnemyCount < maxEnemiesOnScreen) {
          spawnTimerRef.current = 0;
          const enemiesToSpawn = getEnemiesByLevel(gameTimeRef.current * 1000);

          const hasBoss = enemiesToSpawn.some(e => e.type === "boss" || e.questions?.length > 2);
          if (hasBoss) {
            enemiesRef.current.forEach(en => {
              if (en.type !== "boss") {
                en.destroyed = true;
                en.remove = true;
              }
            });
            targetEnemyRef.current = null;
          }

          enemiesToSpawn.forEach((enemyData) => {
            if (enemiesRef.current.filter(en => !en.remove).length < maxEnemiesOnScreen) {
              const en = spawnEnemy(canvas.width, enemyData);
              if (en) {
                const laneHeight = 80;
                const maxLanes = Math.floor((canvas.height - 180) / laneHeight);
                const occupied = enemiesRef.current.filter(o => !o.remove && o.x > canvas.width - 400).map(o => o.lane);
                const available = [];
                for (let i = 0; i < maxLanes; i++) if (!occupied.includes(i)) available.push(i);
                if (available.length > 0) {
                  const lane = available[Math.floor(Math.random() * available.length)];
                  en.lane = lane;
                  en.y = en.type === "boss" ? canvas.height / 2 - 40 : 120 + lane * laneHeight;
                  enemiesRef.current.push(en);
                }
              }
            }
          });
        }

        // Update enemies & bullets
        const speedMultiplier = 1 + (difficultyRef.current - 1) * 0.1;
        updateEnemies(enemiesRef.current, dt * speedMultiplier, canvas.width, p, updateLivesUI);
        enemiesRef.current = cleanupEnemies(enemiesRef.current);

        bulletsRef.current = bulletsRef.current.filter((b) => {
          if (!b.target || b.target.remove || b.target.destroyed) return false;
          const dx = b.target.x - b.x;
          const dy = (b.target.y + 20) - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) return false;
          b.x += (dx / dist) * b.speed * dt;
          b.y += (dy / dist) * b.speed * dt;
          return true;
        });
      }

      // Render
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);

      ctx.fillStyle = "#00ffff";
      bulletsRef.current.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      const player = playerRef.current;
      if (assetsRef.current.ship) {
        ctx.drawImage(assetsRef.current.ship, player.x, player.y, player.width, player.height);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameReady, isPaused, gameOver, initStars, drawBackground]);

  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: "black", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "90px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 50px", pointerEvents: "none", zIndex: 100,
        boxSizing: "border-box", background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
      }}>
        <div id="ui-score" style={{ color: "white", fontSize: "28px", fontFamily: "monospace", fontWeight: "bold", textShadow: "2px 2px 0px #000" }}>
          SCORE: 0
        </div>
        <div id="ui-lives" style={{ fontSize: "28px" }}>❤️ ❤️ ❤️</div>
      </div>

      {gameOver && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 200, color: "white"
        }}>
          <h1 style={{ fontSize: "5rem", margin: 0, color: "#ff4444" }}>MISSION FAILED</h1>
          <p style={{ fontSize: "2rem" }}>FINAL SCORE: {scoreRef.current}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "15px 40px", fontSize: "1.5rem", cursor: "pointer", borderRadius: "8px", border: "none", fontWeight: "bold" }}
          >
            REDEPLOY
          </button>
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
