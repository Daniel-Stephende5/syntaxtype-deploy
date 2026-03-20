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
  const assetsRef = useRef({});
  const [gameReady, setGameReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Brought over from useControls

  // Game State Refs
  const playerRef = useRef({ x: 0, y: 0, width: 100, height: 80, speed: 300 });
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({}); // Brought over from useControls

  const { initStars, drawBackground } = useBackground();

  // --- ACTIONS ---
  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width / 2,
      y: p.y + p.height / 2,
      target,
      speed: 500,
    });
  };

  // --- MASTER INPUT CONTROLLER ---
  // --- MASTER INPUT CONTROLLER ---
useEffect(() => {
  const handleKeyDown = (e) => {
    if (isPaused) return;
    const key = e.key;

    // 1. Movement & System Keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      e.preventDefault();
      keysPressed.current[key] = true;
      return;
    }

    if (key === "Tab") {
      e.preventDefault();
      if (enemiesRef.current.length === 0) return;
      const index = enemiesRef.current.indexOf(targetEnemyRef.current);
      targetEnemyRef.current = enemiesRef.current[(index + 1) % enemiesRef.current.length];
      return;
    }

    if (key === "Backspace") {
      e.preventDefault();
      const target = targetEnemyRef.current;
      if (!target) return;
      if (target.type === "shield" && target.shield) {
        target.answerTyped = target.answerTyped.slice(0, -1);
      } else {
        target.typed = target.typed.slice(0, -1);
      }
      return;
    }

    // 2. Typing Logic
    if (key.length === 1) {
      const char = key.toLowerCase();

      // If no target, try to find one that starts with this character
      if (!targetEnemyRef.current) {
        const potentialTarget = enemiesRef.current.find((en) => {
          if (en.type === "shield" && en.shield) {
            const q = en.questions[en.shieldIndex];
            return q && q.answer.toLowerCase().startsWith(char);
          }
          return en.word.toLowerCase().startsWith(char);
        });

        if (potentialTarget) {
          targetEnemyRef.current = potentialTarget;
        } else {
          return; // No match found, ignore input
        }
      }

      const target = targetEnemyRef.current;

      // 3. Update the Target
      if (target.type === "shield" && target.shield) {
        const q = target.questions[target.shieldIndex];
        const nextMatch = (target.answerTyped + char).toLowerCase();
        
        if (q.answer.toLowerCase().startsWith(nextMatch)) {
          target.answerTyped += key; // Keep original casing if needed
          shootBullet(target);
          if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
            target.shieldIndex++;
            target.answerTyped = "";
            if (target.shieldIndex >= target.questions.length) target.shield = false;
          }
        } else {
          // Mistake: Reset progress but keep target (standard typing game feel)
          target.answerTyped = ""; 
        }
      } else {
        // Normal Enemy Logic
        const nextMatch = (target.typed + char).toLowerCase();
        
        if (target.word.toLowerCase().startsWith(nextMatch)) {
          target.typed += key; 
          shootBullet(target);
          if (target.typed.toLowerCase() === target.word.toLowerCase()) {
            target.destroyed = true;
            target.remove = true;
            targetEnemyRef.current = null; // Kill confirmed, drop target
          }
        } else {
          // Mistake: Reset typed progress
          target.typed = "";
        }
      }
    }
  };

  const handleKeyUp = (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      keysPressed.current[e.key] = false;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}, [isPaused]); // isPaused is the only dependency needed


  // --- MAIN GAME LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    document.body.style.overflow = "hidden";

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars(canvas, 160);
      playerRef.current.x = canvas.width / 2 - 50;
      playerRef.current.y = canvas.height / 2 - 50;
    }

    resize();
    window.addEventListener("resize", resize);

    let running = true;
    let last = performance.now();

    loadAssets({ images: { ship: "/images/nightraider.png" }, sounds: {} })
      .then((loaded) => {
        assetsRef.current = loaded;
        setGameReady(true);
        loop(performance.now());
      })
      .catch(() => {
        setGameReady(true);
        loop(performance.now());
      });

    function updatePlayer(dt) {
      const keys = keysPressed.current;
      const p = playerRef.current;
      const speed = p.speed;

      if (keys["ArrowLeft"]) p.x -= speed * dt;
      if (keys["ArrowRight"]) p.x += speed * dt;
      if (keys["ArrowUp"]) p.y -= speed * dt;
      if (keys["ArrowDown"]) p.y += speed * dt;

      p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));
    }

    function updateBullets(dt) {
      bulletsRef.current = bulletsRef.current.filter((b) => {
        // If target was destroyed, bullets just disappear (or you could let them fly off-screen)
        if (!b.target || b.target.remove) return false;

        const dx = b.target.x - b.x;
        const dy = b.target.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Bullet hits target
        if (dist < 10) {
          // If the enemy is marked destroyed by typing, the bullet arriving confirms the kill visually
          return false;
        }

        b.x += (dx / dist) * b.speed * dt;
        b.y += (dy / dist) * b.speed * dt;
        return true;
      });
    }

    function drawBullets(ctx) {
      ctx.fillStyle = "cyan";
      bulletsRef.current.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function loop(now) {
      if (!running) return;
      if (isPaused) {
        last = now;
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = (now - last) / 1000;
      last = now;

      // --- UPDATE ---
      updatePlayer(dt);

      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 1.5) {
        spawnTimerRef.current = 0;
        const enemy = spawnEnemy(canvas.width, performance.now());
        if (enemy) {
          enemy.y = Math.random() * (canvas.height - 50);
          enemiesRef.current.push(enemy);
        }
      }

      enemiesRef.current = updateEnemies(
        enemiesRef.current,
        dt,
        canvas.width,
        () => {} // handle hit player logic here later
      );

      enemiesRef.current = cleanupEnemies(enemiesRef.current);

      // If the targeted enemy flew off screen, clear the target
      if (targetEnemyRef.current && targetEnemyRef.current.remove) {
        targetEnemyRef.current = null;
      }

      updateBullets(dt);

      // --- RENDER ---
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current); // Make sure GalaxyEnemy.js is updated to highlight target if needed
      drawBullets(ctx);

      const p = playerRef.current;
      const ship = assetsRef.current.ship;
      if (ship) {
        ctx.drawImage(ship, p.x, p.y, p.width, p.height);
      } else {
        // Fallback drawing if image fails to load
        ctx.fillStyle = "blue";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initStars, drawBackground, isPaused]);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", background: "black" }}
      />
      {!gameReady && (
        <div style={{ position: "absolute", top: 20, left: 20, color: "white" }}>
          Loading game…
        </div>
      )}
      {isPaused && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white", fontSize: "2rem" }}>
          PAUSED
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
