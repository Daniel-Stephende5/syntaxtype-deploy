import React, { useEffect, useRef, useState } from "react";
import { useBackground } from "./GalaxyBackground";
import { loadAssets } from "./assets";
import { getEnemiesByLevel, bossEnemy, bossEnemy2, bossEnemy3 } from "./GalaxyLibrary";
import { spawnEnemy, updateEnemies, drawEnemies, cleanupEnemies } from "./GalaxyEnemy";
import { useScoreSubmission } from '../../hooks/useScoreSubmission';
const GalaxyMainGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const assetsRef = useRef({ ship: null });
  
  // Game State Refs
  const gameTimeRef = useRef(0); // This only tracks ACTIVE combat time (non-boss)
  const difficultyRef = useRef(1);
  const realTimeRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const spawnTimerRef = useRef(-1.5);
  const bossStateRef = useRef({
  index: 0,
  lastBossDefeatedTime: 0,
});
  const restartGame = () => {
    // 1. Reset component states
    setGameOver(false);
    setGameWon(false);
    setShowSubmitButton(false);

    // 2. Reset refs
    gameTimeRef.current = 0;
    difficultyRef.current = 1;
    scoreRef.current = 0;
    livesRef.current = 3;
    spawnTimerRef.current = -1.5;
    bossesDefeatedRef.current = 0;
    
    enemiesRef.current = [];
    bulletsRef.current = [];
    targetEnemyRef.current = null;
    playerRef.current = { x: 50, y: 300, width: 80, height: 60, speed: 500 };

    // 3. Reset UI DOM elements
    const scoreEl = document.getElementById("ui-score");
    if (scoreEl) scoreEl.innerText = "SCORE: 0";
    const livesEl = document.getElementById("ui-lives");
    if (livesEl) livesEl.innerText = "❤️ ❤️ ❤️";

    // 4. IMPORTANT: Reset the mutated library values!
    bossEnemy.lastSpawn = 0;
    bossEnemy2.lastSpawn = 0;
    bossEnemy3.spawned = false;
  };
  // Logic Refs
  const playerRef = useRef({ x: 50, y: 300, width: 80, height: 60, speed: 500 });
  const enemiesRef = useRef([]);
  const targetEnemyRef = useRef(null);
  const bulletsRef = useRef([]);
  const keysPressed = useRef({});
const bossesDefeatedRef = useRef(0);
const MAX_BOSSES = 3; 
  // States for UI rendering
  const [gameReady, setGameReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
const [gameWon, setGameWon] = useState(false);
  const { initStars, drawBackground } = useBackground();
const [showSubmitButton, setShowSubmitButton] = useState(false);

const {
  submitScore,
  isSubmitting,
  submitMessage,
  submitSuccess
} = useScoreSubmission();
  // --- UI & GAME HELPERS ---
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
      for (let i = 0; i < 3; i++) hearts += i < livesRef.current ? "❤️ " : "🖤 ";
      livesEl.innerText = hearts;
    }
   if (livesRef.current <= 0) {
 setGameOver(true);
      setGameWon(false); // Player lost
      setShowSubmitButton(true);
}
  };
  const handleSubmitScore = async () => {
    const payload = {
      score: scoreRef.current
    };
    
    const success = await submitScore('GALAXY', payload);
    if (success) {
      setShowSubmitButton(false);
    }
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

  // ✅ Check if boss defeated
  if (target.type === "boss") {
   bossesDefeatedRef.current++;

  bossStateRef.current.lastBossDefeatedTime = gameTimeRef.current;
  bossStateRef.current.index++;

    // 👉 WIN CONDITION
    if (bossesDefeatedRef.current >= MAX_BOSSES) {
      setGameOver(true);
      setGameWon(true);
      setShowSubmitButton(true);

      // Optional: stop everything immediately
      enemiesRef.current.forEach(en => {
        en.destroyed = true;
        en.remove = true;
      });

      targetEnemyRef.current = null;
      return;
    }
  }

  target.destroyed = true;
  if (targetEnemyRef.current === target) targetEnemyRef.current = null;

  setTimeout(() => { target.remove = true; }, 100);
};

  // --- INITIALIZATION ---
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
          const alive = enemiesRef.current.filter((en) => !en.destroyed && !en.remove);
          if (!alive.length) return;
          const idx = alive.indexOf(targetEnemyRef.current);
          targetEnemyRef.current = alive[(idx + 1) % alive.length];
        } else {
          keysPressed.current[key] = true;
        }
        return;
      }

      // 2. Sticky Boss Targeting
      const currentTarget = targetEnemyRef.current;
      const bossActive = currentTarget && currentTarget.type === "boss" && !currentTarget.destroyed;

      if (!bossActive && key.length === 1 && (!currentTarget || currentTarget.remove || currentTarget.destroyed)) {
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

      const active = targetEnemyRef.current;
      if (!active || active.remove || active.destroyed) return;

      // 3. Boss Special (Enter for \n)
      if (key === "Enter" && active.type === "boss" && !active.shield) {
        e.preventDefault();
        const remaining = active.word.slice((active.typed || "").length);
        if (remaining.startsWith("\n")) {
          const match = remaining.match(/^[\n\r]\s*/);
          if (match) {
            active.typed = (active.typed || "") + match[0];
            shootBullet(active);
            if (active.typed.length >= active.word.length) finishEnemy(active);
          }
          return;
        }
      }

      // 4. Standard Typing
      if (key.length === 1) {
        const char = key.toLowerCase();
        if (active.shield) {
          const q = active.questions[active.shieldIndex];
          if (char === q.answer[(active.answerTyped || "").length]?.toLowerCase()) {
            active.answerTyped = (active.answerTyped || "") + key;
            shootBullet(active);
            if (active.answerTyped.toLowerCase() === q.answer.toLowerCase()) {
              active.shieldIndex++;
              active.answerTyped = "";
              if (active.shieldIndex >= active.questions.length) {
                active.shield = false;
                active.typed = "";
              }
            }
          }
        } else {
          const nextIdx = (active.typed || "").length;
          if (char === active.word[nextIdx]?.toLowerCase()) {
            active.typed = (active.typed || "") + key;
            shootBullet(active);
            if (active.typed.toLowerCase() === active.word.toLowerCase()) finishEnemy(active);
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

  // --- MAIN GAME LOOP ---
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
        // --- DIFFICULTY & SPAWN LOGIC ---
        const bossActive = enemiesRef.current.some(en => en.type === "boss" && !en.remove && !en.destroyed);

        // Pause progression while fighting boss
       if (!bossActive) {
  gameTimeRef.current += dt;
  spawnTimerRef.current += dt;
}

realTimeRef.current += dt;

        difficultyRef.current = Math.floor(gameTimeRef.current / 60) + 1;
        const speedMultiplier = 1 + (difficultyRef.current - 1) * 0.15;
        const maxEnemies = 5 + (difficultyRef.current - 1) * 2;

        // Player movement
        const p = playerRef.current;
        const keys = keysPressed.current;
        if (keys["ArrowLeft"]) p.x -= p.speed * dt;
        if (keys["ArrowRight"]) p.x += p.speed * dt;
        if (keys["ArrowUp"]) p.y -= p.speed * dt;
        if (keys["ArrowDown"]) p.y += p.speed * dt;
        p.x = Math.max(10, Math.min(canvas.width - p.width - 10, p.x));
        p.y = Math.max(90, Math.min(canvas.height - 120, p.y));

        // Spawning
        const activeCount = enemiesRef.current.filter(en => !en.remove && !en.destroyed).length;
        if (!bossActive && spawnTimerRef.current > 1.8 && activeCount < maxEnemies) {
          spawnTimerRef.current = 0;
          const enemiesToSpawn = getEnemiesByLevel(realTimeRef.current * 1000, bossStateRef.current);
          
          if (enemiesToSpawn.some(e => e.type === "boss")) {
           
            targetEnemyRef.current = null;
          }

          enemiesToSpawn.forEach((data) => {
            const en = spawnEnemy(canvas.width, data);
            if (en) {
              const laneHeight = 80;
              const maxLanes = Math.floor((canvas.height - 180) / laneHeight);
              const occupied = enemiesRef.current.filter(o => !o.remove && o.x > canvas.width - 400).map(o => o.lane);
              const available = Array.from({length: maxLanes}, (_, i) => i).filter(i => !occupied.includes(i));
              
              en.lane = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 0;
              en.y = en.type === "boss" ? canvas.height / 2 - 40 : 120 + en.lane * laneHeight;
              if (en.type === "boss") targetEnemyRef.current = en;
              enemiesRef.current.push(en);
            }
          });
        }

        // Updates
        updateEnemies(enemiesRef.current, dt * speedMultiplier, canvas.width, p, updateLivesUI);
        enemiesRef.current = cleanupEnemies(enemiesRef.current);

        bulletsRef.current = bulletsRef.current.filter((b) => {
          if (!b.target || b.target.remove || b.target.destroyed) return false;
          const dx = b.target.x - b.x, dy = (b.target.y + 20) - b.y;
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
      bulletsRef.current.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill(); });
      if (assetsRef.current.ship) ctx.drawImage(assetsRef.current.ship, playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height);
      
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameReady, isPaused, gameOver, initStars, drawBackground]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "black", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "90px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 50px", pointerEvents: "none", zIndex: 100,
        background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
      }}>
        <div id="ui-score" style={{ color: "white", fontSize: "28px", fontFamily: "monospace", fontWeight: "bold" }}>SCORE: 0</div>
        <div style={{ color: "#aaa", fontSize: "18px", fontFamily: "monospace" }}>Type the words to clear them out and score, use Tab button to switch targets: </div>
        <div id="ui-lives" style={{ fontSize: "28px" }}>❤️ ❤️ ❤️</div>
      </div>

   {gameOver && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200, color: "white"
        }}>
        <h1 style={{ fontSize: "5rem", color: gameWon ? "#4caf50" : "#ff4444" }}>
            {gameWon ? "MISSION ACCOMPLISHED" : "MISSION FAILED"}
          </h1>
          <p style={{ fontSize: "2rem" }}>FINAL SCORE: {scoreRef.current}</p>
          
          {showSubmitButton && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              {isSubmitting ? (
                <p>Submitting score...</p>
              ) : submitMessage ? (
                <p style={{ color: submitSuccess ? "#4caf50" : "#f44336" }}>{submitMessage}</p>
              ) : (
                <button 
                  onClick={handleSubmitScore}
                  style={{
                    padding: "15px 40px",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    borderRadius: "8px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    marginRight: "20px"
                  }}
                >
                  Submit to Leaderboard
                </button>
              )}
              <button 
                onClick={restartGame} 
                style={{ padding: "15px 40px", fontSize: "1.5rem", cursor: "pointer", borderRadius: "8px" }}
              >
                REDEPLOY
              </button>
            </div>
          )}
          
          {!showSubmitButton && (
            <button onClick={restartGame} style={{ padding: "15px 40px", fontSize: "1.5rem", cursor: "pointer", borderRadius: "8px" }}>REDEPLOY</button>
          )}
        </div>
      )}
    </div>
  );
};

export default GalaxyMainGame;
