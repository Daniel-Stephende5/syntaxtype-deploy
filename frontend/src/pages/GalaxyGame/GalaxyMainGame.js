import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import { spawnEnemy, updateEnemies, drawEnemies, cleanupEnemies } from "./GalaxyEnemy";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const assetsRef = useRef({ ship: null }); // Initialize with null
  const [gameReady, setGameReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const playerRef = useRef({ x: 50, y: 0, width: 100, height: 80, speed: 400 });
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({});

  const { initStars, drawBackground } = useBackground();

  // --- LOGIC HELPERS ---
  const addScore = (enemy) => {
    let pts = enemy.type === "boss" ? 10 : (enemy.type === "shield" ? 2 : 1);
    setScore(s => s + pts);
  };

  const handlePlayerHit = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) setGameOver(true);
      return newLives;
    });
  };

  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width, 
      y: p.y + p.height / 2,
      target, 
      speed: 1200,
    });
  };

  // --- INPUT HANDLING ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || gameOver) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) e.preventDefault();
      
      if (e.key === "Tab") {
        if (enemiesRef.current.length === 0) return;
        const idx = enemiesRef.current.indexOf(targetEnemyRef.current);
        targetEnemyRef.current = enemiesRef.current[(idx + 1) % enemiesRef.current.length];
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        keysPressed.current[e.key] = true;
      }

      if (e.key.length === 1) {
        const char = e.key.toLowerCase();
        if (!targetEnemyRef.current) {
          targetEnemyRef.current = enemiesRef.current.find(en => {
            const toCheck = (en.type === "shield" && en.shield) ? en.questions[en.shieldIndex].answer : en.word;
            return toCheck.toLowerCase().startsWith(char);
          });
        }

        const target = targetEnemyRef.current;
        if (!target) return;

        if (target.type === "shield" && target.shield) {
          const q = target.questions[target.shieldIndex];
          if (char === q.answer[target.answerTyped.length]?.toLowerCase()) {
            target.answerTyped += e.key;
            shootBullet(target);
            if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              target.shieldIndex++;
              target.answerTyped = "";
              if (target.shieldIndex >= target.questions.length) target.shield = false;
            }
          }
        } else {
          if (char === target.word[target.typed.length]?.toLowerCase()) {
            target.typed += e.key;
            shootBullet(target);
            if (target.typed.toLowerCase() === target.word.toLowerCase()) {
              addScore(target);
              target.destroyed = true; target.remove = true; targetEnemyRef.current = null;
            }
          }
        }
      }
    };

    const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [isPaused, gameOver]);

  // --- GAME LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas, 160);
      playerRef.current.y = canvas.height / 2 - 40;
    };

    window.addEventListener("resize", resize);
    resize();

    // Fix: Using process.env.PUBLIC_URL for safer pathing
    loadAssets({ images: { ship: "/assets/nightraider.png" } })
      .then(loaded => { assetsRef.current = loaded; })
      .catch(e => console.warn("Ship image failed to load, using fallback.", e))
      .finally(() => { setGameReady(true); });

    let last = performance.now();
    function loop(now) {
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

        spawnTimerRef.current += dt;
        if (spawnTimerRef.current > 1.5) {
          spawnTimerRef.current = 0;
          const en = spawnEnemy(canvas.width, now);
          if (en) { en.y = Math.random() * (canvas.height - 100); enemiesRef.current.push(en); }
        }

        updateEnemies(enemiesRef.current, dt, canvas.width, p, handlePlayerHit);
        
        enemiesRef.current.forEach(en => {
          if (!en.remove && Math.abs(en.x - p.x) < 70 && Math.abs(en.y - p.y) < 50) {
            en.remove = true; handlePlayerHit();
          }
        });

        enemiesRef.current = cleanupEnemies(enemiesRef.current);
        if (targetEnemyRef.current?.remove) targetEnemyRef.current = null;

        bulletsRef.current = bulletsRef.current.filter(b => {
          if (!b.target || b.target.remove) return false;
          const dx = b.target.x - b.x, dy = b.target.y - b.y, dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 20) return false;
          b.x += (dx/dist) * b.speed * dt; b.y += (dy/dist) * b.speed * dt;
          return true;
        });
      }

      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);

      // Draw Bullets
      ctx.fillStyle = "#00ffff";
      bulletsRef.current.forEach(b => {
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
      });

      // Draw Player Ship or Fallback
      if (assetsRef.current.ship) {
        ctx.drawImage(assetsRef.current.ship, playerRef.current.x, playerRef.current.y, 100, 80);
      } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(playerRef.current.x, playerRef.current.y, 100, 80);
        ctx.strokeStyle = "white";
        ctx.strokeRect(playerRef.current.x, playerRef.current.y, 100, 80);
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, gameOver, gameReady, initStars, drawBackground]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "black", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      
      {/* UI Overlay - Z-Index 10 ensures it stays on top */}
      <div style={{ 
        position: "absolute", top: 0, width: "100%", 
        display: "flex", justifyContent: "space-between", 
        padding: "30px 50px", boxSizing: "border-box",
        pointerEvents: "none", zIndex: 10
      }}>
        <div style={{ fontSize: "28px", color: "white", fontFamily: "monospace", fontWeight: "bold", textShadow: "2px 2px #000" }}>
          SCORE: {score}
        </div>
        <div style={{ fontSize: "28px", fontFamily: "monospace", zIndex: 11 }}>
          <span style={{ color: "white", marginRight: "10px" }}>LIVES:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.2, transition: "opacity 0.3s" }}>❤️</span>
          ))}
        </div>
      </div>

      {!gameReady && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px" }}>
          INITIALIZING SYSTEMS...
        </div>
      )}

      {gameOver && (
        <div style={{ 
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.9)", 
          display: "flex", flexDirection: "column", alignItems: "center", 
          justifyContent: "center", zIndex: 100 
        }}>
          <h1 style={{ fontSize: "5rem", color: "#ff4444", margin: 0 }}>MISSION FAILED</h1>
          <p style={{ fontSize: "2rem", color: "white" }}>FINAL SCORE: {score}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: "15px 40px", fontSize: "1.5rem", background: "#ff4444", 
              color: "white", border: "none", cursor: "pointer", marginTop: "30px",
              borderRadius: "5px", fontWeight: "bold"
            }}>
            RESTART MISSION
          </button>
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
