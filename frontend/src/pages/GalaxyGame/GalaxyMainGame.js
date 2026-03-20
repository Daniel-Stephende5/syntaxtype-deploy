import React, { useEffect, useRef, useState } from "react";
import { useControls } from "./GalaxyControls";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";

import {
  spawnEnemy,
  updateEnemies,
  handleTyping,
  drawEnemies,
  cleanupEnemies,
} from "./GalaxyEnemy";

const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const typedRef = useRef("");
  const assetsRef = useRef({});
  const lastKeyRef = useRef(null);

  const [gameReady, setGameReady] = useState(false);

  // Player
  const playerRef = useRef({ x: 0, y: 0, width: 100, height: 80, speed: 300 });

  // Enemies
  const enemiesRef = useRef([]);
  const levelRef = useRef(1);
  const spawnTimerRef = useRef(0);

  const { initStars, drawBackground } = useBackground();

  // ✅ Controls (fixed typing duplication + invalid keys)
  const controls = useControls({
    onTyped: (key) => {
      if (key.length !== 1) return; // ignore Shift, Arrow, etc.
      if (lastKeyRef.current === key) return; // prevent repeat spam

      lastKeyRef.current = key;

      typedRef.current += key;
      enemiesRef.current = handleTyping(enemiesRef.current, key);
    },
    onBackspace: () => {
      typedRef.current = typedRef.current.slice(0, -1);
      lastKeyRef.current = null;
    },
  });

  useEffect(() => {
    const resetKey = () => {
      lastKeyRef.current = null;
    };

    window.addEventListener("keyup", resetKey);

    return () => {
      window.removeEventListener("keyup", resetKey);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // prevent scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      initStars(canvas, 160);

      // center player
      playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvas.height / 2 - playerRef.current.height / 2;
    }

    resize();
    window.addEventListener("resize", resize);

    let running = true;
    let last = performance.now();

    // Load assets
    loadAssets({ images: { ship: "/images/nightraider.png" }, sounds: {} })
      .then((loaded) => {
        assetsRef.current = loaded;
        setGameReady(true);
        loop(performance.now());
      })
      .catch((err) => {
        console.error("Failed to load assets:", err);
        setGameReady(true);
        loop(performance.now());
      });

    function updatePlayer(dt) {
      const keys = controls.keysPressed.current;
      const speed = playerRef.current.speed;

      if (keys["ArrowLeft"]) {
        playerRef.current.x = Math.max(0, playerRef.current.x - speed * dt);
      }
      if (keys["ArrowRight"]) {
        playerRef.current.x = Math.min(
          canvas.width - playerRef.current.width,
          playerRef.current.x + speed * dt
        );
      }
      if (keys["ArrowUp"]) {
        playerRef.current.y = Math.max(0, playerRef.current.y - speed * dt);
      }
      if (keys["ArrowDown"]) {
        playerRef.current.y = Math.min(
          canvas.height - playerRef.current.height,
          playerRef.current.y + speed * dt
        );
      }
    }

    function drawPlayer() {
      const p = playerRef.current;
      const shipImg = assetsRef.current.ship;

      if (shipImg) {
        ctx.drawImage(shipImg, p.x, p.y, p.width, p.height);
      } else {
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }

    function loop(now) {
      if (!running) return;

      const dt = (now - last) / 1000;
      last = now;

      // --- UPDATE ---

      updatePlayer(dt);

      // Level progression
      levelRef.current += dt * 0.05;

      // Spawn enemies
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 1.5) {
        spawnTimerRef.current = 0;

        const enemy = spawnEnemy(
          canvas.width,
          Math.floor(levelRef.current)
        );

        // ✅ ensure stable X (prevents weird drift feeling)
        enemy.x = Math.max(50, Math.min(canvas.width - 200, enemy.x));

        enemiesRef.current.push(enemy);
      }

      // Update enemies (vertical only)
      enemiesRef.current = updateEnemies(
        enemiesRef.current,
        dt,
        canvas.height,
        (enemy) => {
          console.log("Player hit!", enemy);
        }
      );

      // Cleanup
      enemiesRef.current = cleanupEnemies(enemiesRef.current);

      // --- RENDER ---

      drawBackground(ctx, canvas);

      // ✅ fix text rendering drift illusion
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      drawPlayer();
      drawEnemies(ctx, enemiesRef.current);

      // HUD
      ctx.fillStyle = "white";
      ctx.font = "18px monospace";
      ctx.fillText("Typed: " + typedRef.current, 16, 36);

      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
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
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "black",
        }}
      />

      {!gameReady && (
        <div style={{ color: "white", padding: 20 }}>
          Loading game…
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
