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

  // --- UI & UTILITY HELPERS ---
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

  const finishEnemy = (target) => {
    const pts = target.type === "boss" ? 50 : (target.type === "shield" ? 2 : 1);
    updateScoreUI(pts);
    target.destroyed = true;
    
    // Clear the ref so the player can target the next enemy
    if (targetEnemyRef.current === target) {
      targetEnemyRef.current = null;
    }
    
    setTimeout(() => { target.remove = true; }, 100);
  };

  // --- ASSET LOADING ---
  useEffect(() => {
    loadAssets({ images: { ship: "/images/nightraider.png" } })
      .then((loaded) => {
        assetsRef.current = loaded;
        setGameReady(true);
      })
      .catch((err) => console.error("Asset load failed", err));
  }, []);

  // --- INPUT HANDLING ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || gameOver) return;
      const key = e.key;

      // 1. Navigation & Tab Switching
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

      // 2. Targeting Logic (STICKY BOSS LOCK)
      const currentTarget = targetEnemyRef.current;
      const isBossTargeted = currentTarget && currentTarget.type === "boss" && !currentTarget.destroyed;

      // Only search for a new target if we aren't already locked onto a living Boss
      if (!isBossTargeted && key.length === 1 && (!currentTarget || currentTarget.remove || currentTarget.destroyed)) {
        const char = key.toLowerCase();
        const match = enemiesRef.current.find((en) => {
          if (en.destroyed || en.remove || en.hitPlayer) return false;
          const wordToMatch = (en.shield && en.questions[en.shieldIndex]) 
            ? en.questions[en.shieldIndex].answer 
            : en.word;
          return wordToMatch.toLowerCase().startsWith(char);
        });
        if (match) targetEnemyRef.current = match;
      }

      // Re-evaluate target after potential selection
      const activeTarget = targetEnemyRef.current;
      if (!activeTarget || activeTarget.remove || activeTarget.destroyed) return;

      // 3. Boss Special (Enter for Newline)
      if (key === "Enter" && activeTarget.type === "boss" && !activeTarget.shield) {
        e.preventDefault();
        const currentTyped = activeTarget.typed || "";
        const remaining = activeTarget.word.slice(currentTyped.length);

        if (remaining.startsWith("\n")) {
          const match = remaining.match(/^[\n\r]\s*/); 
          if (match) {
            activeTarget.typed = currentTyped + match[0];
            shootBullet(activeTarget);
            if (activeTarget.typed.length >= activeTarget.word.length) {
              finishEnemy(activeTarget);
            }
          }
          return;
        }
      }

      // 4. Standard Typing
      if (key.length === 1) {
        const char = key.toLowerCase();

        if (activeTarget.shield) {
          const q = activeTarget.questions[activeTarget.shieldIndex];
          const expectedChar = q.answer[activeTarget.answerTyped.length]?.toLowerCase();
          if (char === expectedChar) {
            activeTarget.answerTyped += key;
            shootBullet(activeTarget);
            if (activeTarget.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              activeTarget.shieldIndex++;
              activeTarget.answerTyped = "";
              if (activeTarget.shieldIndex >= activeTarget.questions.length) {
                activeTarget.shield = false;
                activeTarget.typed = "";
              }
            }
          }
        } else {
          const nextIdx = (activeTarget.typed || "").length;
          const expectedChar = activeTarget.word[nextIdx]?.toLowerCase();
          if (char === expectedChar) {
            activeTarget.typed = (activeTarget.typed || "") + key;
            shootBullet(activeTarget);
            if (activeTarget.typed.toLowerCase() === activeTarget.word.toLowerCase()) {
              finishEnemy(activeTarget);
            }
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

  // --- MAIN LOOP ---
  useEffect(() => {
    if (!gameReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
        const currentLevel = Math.floor(gameTimeRef.current / 60) + 1;
        difficultyRef.current = currentLevel;

        const p = playerRef.current;
        const keys = keysPressed.current;

        // Player Movement
        if (keys["ArrowLeft"]) p.x -= p.speed * dt;
        if (keys["ArrowRight"]) p.x += p.speed * dt;
        if (keys["ArrowUp"]) p.y -= p.speed * dt;
        if (keys["ArrowDown"]) p.y += p.speed * dt;

        p.x = Math.max(10, Math.min(canvas.width - p.width - 10, p.x));
        p.y = Math.max(90, Math.min(canvas.height - 120, p.y));

        // --- ENEMY SPAWNING & BOSS LOCK ---
        const bossOnScreen = enemiesRef.current.some(en => en.type === "boss" && !en.remove && !en.destroyed);
        
        // Timer only advances if the stage is clear of Bosses
        if (!bossOnScreen) {
          spawnTimerRef.current += dt;
        }

        const maxEnemies = 5 + Math.floor(gameTimeRef.current / 60) * 2;
        const activeCount = enemiesRef.current.filter(en => !en.remove && !en.destroyed).length;

        if (!bossOnScreen && spawnTimerRef.current > 1.8 && activeCount < maxEnemies) {
          spawnTimerRef.current = 0;
          const enemiesToSpawn = getEnemiesByLevel(gameTimeRef.current * 1000);

          const hasBoss = enemiesToSpawn.some(e => e.type === "boss");
          if (hasBoss) {
            // Clear regular mobs for the boss fight
            enemiesRef.current.forEach(en => {
              en.destroyed = true;
              en.remove = true;
            });
            targetEnemyRef.current = null;
          }

          enemiesToSpawn.forEach((enemyData) => {
            const en = spawnEnemy(canvas.width, enemyData);
            if (en) {
              const laneHeight = 80;
              const maxLanes = Math.floor((canvas.height - 180) / laneHeight);
              const occupied = enemiesRef.current.filter(o => !o.remove && o.x > canvas.width - 400).map(o => o.lane);
              const available = [];
              for (let i = 0; i < maxLanes; i++) if (!occupied.includes(i)) available.push(i);
              
              const lane = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 0;
              en.lane = lane;
              en.y = en.type === "boss" ? canvas.height / 2 - 40 : 120 + lane * laneHeight;
              
              // AUTO-TARGET BOSS
              if (en.type === "boss") targetEnemyRef.current = en;
              
              enemiesRef.current.push(en);
            }
          });
        }

        // --- UPDATES ---
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

      // --- RENDER ---
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);

      ctx.fillStyle = "#00ffff";
      bulletsRef.current.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      if (assetsRef.current.ship) {
        ctx.drawImage(assetsRef.current.ship, playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height);
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
        <div id="ui-score" style={{ color: "white", fontSize: "28px", fontFamily: "monospace", fontWeight: "bold" }}>
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
            style={{ padding: "15px 40px", fontSize: "1.5rem", cursor: "pointer", borderRadius: "8px" }}
          >
            REDEPLOY
          </button>
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
