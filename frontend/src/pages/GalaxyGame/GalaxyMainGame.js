import React, { useEffect, useRef, useState } from "react";
import { useControls } from "./GalaxyControls";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import { enemyLibrary } from "./GalaxyEnemyLibrary"; // your library
import { v4 as uuidv4 } from "uuid";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const typedRef = useRef("");
  const assetsRef = useRef({});
  const [gameReady, setGameReady] = useState(false);
  const scoreRef = useRef(0);

  // Player state
  const playerRef = useRef({ x: 0, y: 0, width: 100, height: 80, speed: 300, lives: 3 });

  // Enemies
  const enemiesRef = useRef([]);

  const { initStars, drawBackground } = useBackground();

  const controls = useControls({
    onTyped: (t) => (typedRef.current = t),
    onBackspace: (t) => (typedRef.current = t),
  });

  // Spawn new enemy (type: "typing" | "shield" | "boss")
  const spawnEnemy = (type = "typing") => {
    const pool = enemyLibrary.filter((e) => e.type === type);
    if (!pool.length) return;

    const def = pool[Math.floor(Math.random() * pool.length)];
    enemiesRef.current.push({
      ...def,
      id: uuidv4(),
      x: Math.random() * 600 + 50,
      y: -50,
      progress: 0,
      alive: true,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // prevent page scroll while game is active
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars(canvas, 160);
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height - 120;
    }
    resize();
    window.addEventListener("resize", resize);

    let running = true;
    let last = performance.now();

    // load assets
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

    // Spawn boss every 90s
    const bossInterval = setInterval(() => spawnEnemy("boss"), 90000);

    // Spawn normal/shield enemies periodically
    const enemyInterval = setInterval(() => {
      const type = Math.random() < 0.3 ? "shield" : "typing";
      spawnEnemy(type);
    }, 2500);

    // --- Game loop ---
    function updatePlayer(dt) {
      const keys = controls.keysPressed.current;
      const speed = playerRef.current.speed;
      if (keys["ArrowLeft"]) playerRef.current.x = Math.max(0, playerRef.current.x - speed * dt);
      if (keys["ArrowRight"])
        playerRef.current.x = Math.min(canvas.width - playerRef.current.width, playerRef.current.x + speed * dt);
      if (keys["ArrowUp"]) playerRef.current.y = Math.max(0, playerRef.current.y - speed * dt);
      if (keys["ArrowDown"])
        playerRef.current.y = Math.min(canvas.height - playerRef.current.height, playerRef.current.y + speed * dt);
    }

    function updateEnemies(dt) {
      const typed = typedRef.current;

      enemiesRef.current.forEach((e) => {
        e.y += e.speed * dt;

        // Collision with player
        const p = playerRef.current;
        if (
          e.y + 40 > p.y &&
          e.y < p.y + p.height &&
          e.x + 200 > p.x &&
          e.x < p.x + p.width
        ) {
          p.lives -= 1;
          e.alive = false;
        }

        // Typing progress
        if (typed.length && e.alive) {
          const target = e.type === "shield" ? e.question?.answer : e.word;
          if (target && target.startsWith(typed)) {
            e.progress = typed.length;
            if (e.progress >= target.length) {
              scoreRef.current += 10;
              e.alive = false;
              typedRef.current = ""; // reset typed
            }
          }
        }
      });

      enemiesRef.current = enemiesRef.current.filter((e) => e.alive);
    }

    function drawPlayer() {
      const p = playerRef.current;
      const shipImg = assetsRef.current.ship;
      if (shipImg) ctx.drawImage(shipImg, p.x, p.y, p.width, p.height);
      else {
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }

    function drawEnemies() {
      enemiesRef.current.forEach((e) => {
        ctx.font = "20px monospace";
        if (e.type === "shield") ctx.fillStyle = "#ff9900";
        else if (e.type === "boss") ctx.fillStyle = "#ff00ff";
        else ctx.fillStyle = "#ff0000";

        const displayWord =
          e.type === "shield"
            ? e.hidden || "_ ".repeat(e.question.answer.length)
            : e.word;

        // highlight typed progress
        let before = "";
        let after = displayWord;
        if (e.progress > 0) {
          before = displayWord.slice(0, e.progress);
          after = displayWord.slice(e.progress);
        }

        ctx.fillText(before, e.x, e.y);
        ctx.fillStyle = "white";
        ctx.fillText(after, e.x + ctx.measureText(before).width, e.y);
      });
    }

    function loop(now) {
      if (!running) return;
      const dt = (now - last) / 1000;
      last = now;

      updatePlayer(dt);
      updateEnemies(dt);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(ctx, canvas);
      drawPlayer();
      drawEnemies();

      // HUD
      ctx.fillStyle = "white";
      ctx.font = "18px monospace";
      ctx.fillText(`Typed: ${typedRef.current}`, 16, 36);
      ctx.fillText(`Lives: ${playerRef.current.lives}`, 16, 60);
      ctx.fillText(`Score: ${scoreRef.current}`, 16, 84);

      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      clearInterval(bossInterval);
      clearInterval(enemyInterval);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      document.body.style.overflow = prevOverflow || "";
    };
  }, [initStars, drawBackground, controls]);

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--navbar-height, 64px)",
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", background: "black" }}
      />
      {!gameReady && <div style={{ color: "white", padding: 20 }}>Loading game…</div>}
    </div>
  );
};

export default GalaxyMainGame;
