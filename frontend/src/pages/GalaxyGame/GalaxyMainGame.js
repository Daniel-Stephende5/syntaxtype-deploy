import React, { useEffect, useRef, useState } from "react";
import { useControls } from "./GalaxyControls";
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

  // Player
  const playerRef = useRef({ x: 0, y: 0, width: 100, height: 80, speed: 300 });

  // Enemies
  const enemiesRef = useRef([]);
  const spawnTimerRef = useRef(0);

  // Target + Bullets
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);

  const { initStars, drawBackground } = useBackground();

  // Shoot bullet towards target
  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width / 2,
      y: p.y + p.height / 2,
      target,
      speed: 500,
    });
  };

  // Controls
  const controls = useControls({
    onTyped: (char) => {
      if (char.length !== 1) return;
      char = char.toLowerCase();

      // Acquire target if none
      if (!targetEnemyRef.current) {
        const target = enemiesRef.current.find((e) => {
          if (e.type === "shield" && e.shield) {
            const q = e.questions[e.shieldIndex];
            return q && q.answer.startsWith(char);
          }
          return e.word.toLowerCase().startsWith(char);
        });
        if (!target) return;
        targetEnemyRef.current = target;
      }

      const target = targetEnemyRef.current;

      // Shoot bullet on keystroke
      shootBullet(target);

      // Shield typing
      if (target.type === "shield" && target.shield) {
        const q = target.questions[target.shieldIndex];
        if (!q) return;

        if (q.answer.startsWith(target.answerTyped + char)) {
          target.answerTyped += char;
          if (target.answerTyped === q.answer) {
            target.shieldIndex++;
            target.answerTyped = "";
            if (target.shieldIndex >= target.questions.length) {
              target.shield = false;
            }
          }
        } else {
          target.answerTyped = "";
          targetEnemyRef.current = null;
        }
      }
      // Normal enemy typing
      else {
        if (target.word.toLowerCase().startsWith(target.typed + char)) {
          target.typed += char;
          if (target.typed === target.word) {
            target.destroyed = true;
            target.remove = true;
            targetEnemyRef.current = null;
          }
        } else {
          target.typed = "";
          targetEnemyRef.current = null;
        }
      }
    },

    onBackspace: () => {
      const target = targetEnemyRef.current;
      if (!target) return;
      if (target.type === "shield" && target.shield) {
        target.answerTyped = target.answerTyped.slice(0, -1);
      } else {
        target.typed = target.typed.slice(0, -1);
      }
    },
  });

  // TAB to switch target
  useEffect(() => {
    const handleTab = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (enemiesRef.current.length === 0) return;

        const current = targetEnemyRef.current;
        const index = enemiesRef.current.indexOf(current);
        const next =
          enemiesRef.current[(index + 1) % enemiesRef.current.length];
        targetEnemyRef.current = next;
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

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
      playerRef.current.y = canvas.height / 2 - 50; // center
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
      const keys = controls.keysPressed.current;
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

        if (dist < 10) {
          b.target.destroyed = true;
          b.target.remove = true;
          if (b.target === targetEnemyRef.current) targetEnemyRef.current = null;
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
      const dt = (now - last) / 1000;
      last = now;

      // --- UPDATE ---
      updatePlayer(dt);

      // Spawn enemies every 1.5s
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 1.5) {
        spawnTimerRef.current = 0;
        const enemy = spawnEnemy(canvas.width, performance.now());
        if (enemy) {
          enemy.y = Math.random() * (canvas.height - 50);
          enemiesRef.current.push(enemy);
        }
      }

      // Update enemy positions
      enemiesRef.current = updateEnemies(
        enemiesRef.current,
        dt,
        canvas.width,
        () => {}
      );

      enemiesRef.current = cleanupEnemies(enemiesRef.current);

      if (targetEnemyRef.current && targetEnemyRef.current.remove) {
        targetEnemyRef.current = null;
      }

      updateBullets(dt);

      // --- RENDER ---
      drawBackground(ctx, canvas);
      drawEnemies(ctx, enemiesRef.current, targetEnemyRef.current);
      drawBullets(ctx);

      const p = playerRef.current;
      const ship = assetsRef.current.ship;
      if (ship) ctx.drawImage(ship, p.x, p.y, p.width, p.height);

      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initStars, drawBackground, controls]);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", background: "black" }}
      />
      {!gameReady && (
        <div style={{ color: "white", padding: 20 }}>Loading game…</div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
