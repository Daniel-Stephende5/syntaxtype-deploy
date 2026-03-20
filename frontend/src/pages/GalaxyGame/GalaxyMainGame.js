import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";

// Sample enemy library
const ENEMY_LIBRARY = [
  { type: "normal", word: "hello", speed: 50 },
  { type: "normal", word: "world", speed: 60 },
  { type: "shield", word: "", speed: 40, questions: [{ prompt: "Type 'shield'", answer: "shield" }] },
];

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

  // Background
  const { initStars, drawBackground } = useBackground();

  // --- Helper: spawn enemy ---
  const spawnEnemy = (canvasWidth) => {
    const template = ENEMY_LIBRARY[Math.floor(Math.random() * ENEMY_LIBRARY.length)];
    return {
      ...template,
      x: canvasWidth + 50,
      y: Math.random() * 400,
      typed: "",
      shieldIndex: 0,
      answerTyped: "",
      shield: template.type === "shield",
      destroyed: false,
      remove: false,
    };
  };

  // --- Shoot bullet ---
  const shootBullet = (target) => {
    const p = playerRef.current;
    bulletsRef.current.push({
      x: p.x + p.width / 2,
      y: p.y + p.height / 2,
      target,
      speed: 500,
    });
  };

  // --- Typing controls ---
  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key;
      if (key.length !== 1) return; // only single character keys
      const char = key.toLowerCase();

      // Acquire target if none
      if (!targetEnemyRef.current) {
        targetEnemyRef.current = enemiesRef.current.find((e) => {
          if (e.type === "shield" && e.shield) {
            const q = e.questions[e.shieldIndex];
            return q && q.answer.startsWith(char);
          }
          return e.word.toLowerCase().startsWith(char);
        });
        if (!targetEnemyRef.current) return;
      }

      const target = targetEnemyRef.current;

      // Shoot bullet
      shootBullet(target);

      // --- Shield enemy typing ---
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
      // --- Normal enemy typing ---
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
    };

    const handleBackspace = (e) => {
      if (e.key !== "Backspace") return;
      const target = targetEnemyRef.current;
      if (!target) return;

      if (target.type === "shield" && target.shield) {
        target.answerTyped = target.answerTyped.slice(0, -1);
      } else {
        target.typed = target.typed.slice(0, -1);
      }
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("keydown", handleBackspace);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keydown", handleBackspace);
    };
  }, []);

  // --- TAB to switch target ---
  useEffect(() => {
    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      if (enemiesRef.current.length === 0) return;

      const current = targetEnemyRef.current;
      const index = enemiesRef.current.indexOf(current);
      targetEnemyRef.current = enemiesRef.current[(index + 1) % enemiesRef.current.length];
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  // --- Main game loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    document.body.style.overflow = "hidden";

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars(canvas, 160);
      playerRef.current.x = canvas.width / 2 - 50;
      playerRef.current.y = canvas.height / 2 - 50;
    };
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

    const loop = (now) => {
      if (!running) return;
      const dt = (now - last) / 1000;
      last = now;

      // --- Player movement ---
      const keys = {}; // could integrate arrow keys later
      const p = playerRef.current;
      p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));

      // --- Spawn enemies ---
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 1.5) {
        spawnTimerRef.current = 0;
        enemiesRef.current.push(spawnEnemy(canvas.width));
      }

      // --- Move enemies ---
      enemiesRef.current.forEach((e) => e.x -= e.speed * dt);
      enemiesRef.current = enemiesRef.current.filter((e) => !e.remove);

      // --- Move bullets ---
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

      // --- Render ---
      drawBackground(ctx, canvas);

      enemiesRef.current.forEach((e) => {
        ctx.font = e.type === "shield" ? "16px monospace" : "18px monospace";
        if (e.type === "shield" && e.shield) {
          const q = e.questions[e.shieldIndex];
          if (!q) return;
          ctx.fillStyle = "red";
          ctx.fillText("🛡 " + q.prompt, e.x, e.y);
          const hidden = q.answer
            .split("")
            .map((c, i) => (i < e.answerTyped.length ? c : "_"))
            .join(" ");
          ctx.fillStyle = "yellow";
          ctx.fillText(hidden, e.x, e.y + 20);
        } else {
          const typedPart = e.typed;
          const remaining = e.word.slice(typedPart.length);
          ctx.fillStyle = "#0f0";
          ctx.fillText(typedPart, e.x, e.y);
          ctx.fillStyle = "#fff";
          ctx.fillText(remaining, e.x + ctx.measureText(typedPart).width, e.y);
        }
      });

      bulletsRef.current.forEach((b) => {
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      const ship = assetsRef.current.ship;
      if (ship) ctx.drawImage(ship, p.x, p.y, p.width, p.height);

      animationRef.current = requestAnimationFrame(loop);
    };

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initStars, drawBackground]);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", background: "black" }}
      />
      {!gameReady && <div style={{ color: "white", padding: 20 }}>Loading game…</div>}
    </div>
  );
};

export default GalaxyMainGame;
