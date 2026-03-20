import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import { spawnEnemy, updateEnemies, drawEnemies, cleanupEnemies } from "./GalaxyEnemy";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const assetsRef = useRef({});
  const [gameReady, setGameReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game Stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Refs for logic
  const playerRef = useRef({ x: 0, y: 0, width: 100, height: 80, speed: 400 });
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({});

  const { initStars, drawBackground } = useBackground();

  const addScore = (enemy) => {
    let pts = 1;
    if (enemy.type === "shield") pts = 2;
    if (enemy.type === "boss") pts = 10;
    setScore(s => s + pts);
  };

  const handlePlayerHit = () => {
    setLives(prev => {
      if (prev <= 1) setGameOver(true);
      return prev - 1;
    });
  };

  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width, y: p.y + p.height / 2,
      target, speed: 1000,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || gameOver) return;
      const key = e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault(); keysPressed.current[key] = true; return;
      }
      if (key === "Tab") {
        e.preventDefault();
        if (enemiesRef.current.length === 0) return;
        const idx = enemiesRef.current.indexOf(targetEnemyRef.current);
        targetEnemyRef.current = enemiesRef.current[(idx + 1) % enemiesRef.current.length];
        return;
      }
      if (key.length === 1) {
        const char = key.toLowerCase();
        if (!targetEnemyRef.current) {
          const match = enemiesRef.current.find(en => {
            const toCheck = (en.type === "shield" && en.shield) ? en.questions[en.shieldIndex].answer : en.word;
            return toCheck.toLowerCase().startsWith(char);
          });
          if (match) targetEnemyRef.current = match;
          else return;
        }
        const target = targetEnemyRef.current;
        if (target.type === "shield" && target.shield) {
          const q = target.questions[target.shieldIndex];
          if (char === q.answer[target.answerTyped.length]?.toLowerCase()) {
            target.answerTyped += key; shootBullet(target);
            if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              target.shieldIndex++; target.answerTyped = "";
              if (target.shieldIndex >= target.questions.length) target.shield = false;
            }
          }
        } else {
          if (char === target.word[target.typed.length]?.toLowerCase()) {
            target.typed += key; shootBullet(target);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      initStars(canvas, 160);
      playerRef.current.x = 50; playerRef.current.y = canvas.height / 2;
    };
    window.addEventListener("resize", resize); resize();

    let last = performance.now();
    loadAssets({ images: { ship: "/images/nightraider.png" } }).finally(() => {
      setGameReady(true); requestAnimationFrame(loop);
    });

    function loop(now) {
      if (gameOver) return;
      const dt = (now - last) / 1000; last = now;
      if (!isPaused) {
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
        
        // Ship Collision
        enemiesRef.current.forEach(en => {
          if (!en.remove && Math.abs(en.x - p.x) < 60 && Math.abs(en.y - p.y) < 40) {
            en.remove = true; handlePlayerHit();
          }
        });

        enemiesRef.current = cleanupEnemies(enemiesRef.current);
        bulletsRef.current = bulletsRef.current.filter(b => {
          if (!b.target || b.target.remove) return false;
          const dx = b.target.x - b.x, dy = b.target.y - b.y, dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 15) return false;
          b.x += (dx/dist) * b.speed * dt; b.y += (dy/dist) * b.speed * dt;
          return true;
        });
      }
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);
      ctx.fillStyle = "cyan"; bulletsRef.current.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill(); });
      if (assetsRef.current.ship) ctx.drawImage(assetsRef.current.ship, playerRef.current.x, playerRef.current.y, 100, 80);
      animationRef.current = requestAnimationFrame(loop);
    }
    return () => window.removeEventListener("resize", resize);
  }, [isPaused, gameOver, initStars, drawBackground]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "black", color: "white", fontFamily: "monospace" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      
      {/* UI Overlay */}
      <div style={{ position: "absolute", top: 20, width: "100%", display: "flex", justifyContent: "space-between", padding: "0 40px", boxSizing: "border-box" }}>
        <div style={{ fontSize: "24px" }}>SCORE: {score}</div>
        <div style={{ fontSize: "24px" }}>LIVES: {"❤️".repeat(lives)}</div>
      </div>

      {gameOver && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ fontSize: "5rem", color: "#ff4444", margin: 0 }}>GAME OVER</h1>
          <p style={{ fontSize: "2rem" }}>FINAL SCORE: {score}</p>
          <button onClick={() => window.location.reload()} style={{ padding: "15px 30px", fontSize: "1.5rem", background: "white", border: "none", cursor: "pointer", marginTop: "20px" }}>RETRY</button>
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
