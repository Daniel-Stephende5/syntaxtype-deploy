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
  const [isPaused, setIsPaused] = useState(false);

  // --- GAME STATE ---
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const playerRef = useRef({ x: 0, y: 0, width: 100, height: 80, speed: 300 });
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({});

  const { initStars, drawBackground } = useBackground();

  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width / 2,
      y: p.y + p.height / 2,
      target,
      speed: 500,
    });
  };

  // --- INPUT HANDLER (TYPING + MOVEMENT) ---
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

      // Tab Targeting
      if (key === "Tab") {
        e.preventDefault();
        if (!enemiesRef.current.length) return;
        const idx = enemiesRef.current.indexOf(targetEnemyRef.current);
        targetEnemyRef.current =
          enemiesRef.current[(idx + 1) % enemiesRef.current.length];
        return;
      }

      // Backspace
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

      // Typing letters
      if (key.length === 1) {
        const char = key.toLowerCase();
        if (!targetEnemyRef.current) {
          const match = enemiesRef.current.find((en) => {
            const toCheck =
              en.type === "shield" && en.shield
                ? en.questions[en.shieldIndex].answer
                : en.word;
            return toCheck.toLowerCase().startsWith(char);
          });
          if (!match) return;
          targetEnemyRef.current = match;
        }

        const target = targetEnemyRef.current;

        // Shield Enemy
        if (target.type === "shield" && target.shield) {
          const q = target.questions[target.shieldIndex];
          const nextCharIndex = target.answerTyped.length;
          const expectedChar = q.answer[nextCharIndex]?.toLowerCase();

          if (char === expectedChar) {
            target.answerTyped += key;
            shootBullet(target);

            // Completed this shield question
            if (target.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              target.shieldIndex++;
              target.answerTyped = "";
              if (target.shieldIndex >= target.questions.length) {
                target.shield = false;
                target.destroyed = true;
                target.remove = true;
                targetEnemyRef.current = null;
                setScore((s) => s + 2); // Shield enemy full cleared
              } else {
                setScore((s) => s + 2); // Each shield question
              }
            }
          }
        } 
        // Normal Enemy
        else {
          const nextCharIndex = (target.typed || "").length;
          const expectedChar = target.word[nextCharIndex]?.toLowerCase();

          if (char === expectedChar) {
            target.typed = (target.typed || "") + key;
            shootBullet(target);

            if (target.typed.toLowerCase() === target.word.toLowerCase()) {
              target.destroyed = true;
              target.remove = true;
              targetEnemyRef.current = null;
              setScore((s) => s + 1); // Normal enemy
            }
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
  }, [isPaused, gameOver]);

  // --- MAIN LOOP ---
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
        if (!b.target || b.target.remove) return false;
        const dx = b.target.x - b.x;
        const dy = b.target.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) return false;
        b.x += (dx / dist) * b.speed * dt;
        b.y += (dy / dist) * b.speed * dt;
        return true;
      });
    }

    function loop(now) {
      if (!running) return;
      if (isPaused || gameOver) {
        last = now;
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = (now - last) / 1000;
      last = now;

      // --- UPDATE ---
      updatePlayer(dt);

      // Spawn enemies
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 1.5) {
        spawnTimerRef.current = 0;
        const enemy = spawnEnemy(canvas.width, performance.now());
        if (enemy) {
          enemy.y = Math.random() * (canvas.height - 50);
          enemiesRef.current.push(enemy);
        }
      }

      // Update enemies
      enemiesRef.current = updateEnemies(
        enemiesRef.current,
        dt,
        canvas.width,
        () => {
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) setGameOver(true);
            return newLives;
          });
        }
      );

      enemiesRef.current = cleanupEnemies(enemiesRef.current);

      if (targetEnemyRef.current?.remove) targetEnemyRef.current = null;

      updateBullets(dt);

      // --- RENDER ---
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);
      bulletsRef.current.forEach((b) => {
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      const p = playerRef.current;
      const ship = assetsRef.current.ship;
      if (ship) ctx.drawImage(ship, p.x, p.y, p.width, p.height);
      else {
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
  }, [initStars, drawBackground, isPaused, gameOver]);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", background: "black" }}
      />
      {/* Overlay: Score & Lives */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Lives as hearts */}
        {Array.from({ length: lives }).map((_, i) => (
          <span key={i} style={{ color: "red" }}>❤️</span>
        ))}
        <span style={{ marginLeft: "20px" }}>Score: {score}</span>
      </div>

      {!gameReady && (
        <div style={{ position: "absolute", top: 20, left: 20, color: "white" }}>
          Loading game…
        </div>
      )}
      {isPaused && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "2rem",
          }}
        >
          PAUSED
        </div>
      )}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "red",
            fontSize: "3rem",
          }}
        >
          GAME OVER
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
