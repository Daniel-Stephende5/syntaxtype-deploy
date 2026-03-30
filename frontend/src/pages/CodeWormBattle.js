import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const PLAYER_SIZE = 250;
  const ENEMY_SIZE = 250;

  // --- GAME STATE ---
  const [enemyHP, setEnemyHP] = useState(50);
  const [playerHP, setPlayerHP] = useState(40);
  const [assembled, setAssembled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [flash, setFlash] = useState(false);
  const [playerSprite, setPlayerSprite] = useState("/images/idleedit2.png");
  const [enemySprite, setEnemySprite] = useState("/images/enemy_idle(1).png");
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ NEW

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // --- PRELOAD ASSETS ---
  useEffect(() => {
    const assets = [
      "/images/idleedit2.png",
      "/images/spriteedit.gif",
      "/images/enemy_idle(1).png",
      "/images/enemyattack.gif",
      "/images/idledamage.png",
      "/images/enemy_idle(damage).png",
    ];

    let loaded = 0;

    assets.forEach((src) => {
      const ext = src.split(".").pop();

      if (ext === "webm") {
        const vid = document.createElement("video");
        vid.src = src;
        vid.onloadeddata = () => {
          loaded++;
          if (loaded === assets.length) setLoading(false);
        };
      } else {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loaded++;
          if (loaded === assets.length) setLoading(false);
        };
      }
    });
  }, []);

  // --- SHUFFLE ---
  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // --- FUNCTIONS ---
  const validFunctions = [
    [
      ["void attack", "(", "Player player", ",", "Enemy enemy", ")"],
      ["{"],
      ["int dmg = rand() % 6 + 5;"],
      ["enemy.hp -= dmg;"],
      ["return dmg;"],
      ["}"],
    ],
  ];

  const [currentFunction, setCurrentFunction] = useState([]);
  const [bank, setBank] = useState([]);

  const generateNewFunction = () => {
    const func = validFunctions[Math.floor(Math.random() * validFunctions.length)];
    setCurrentFunction(func);
    setBank(shuffleArray(func.flat()));
    setAssembled([]);
  };

  useEffect(() => {
    generateNewFunction();
  }, []);

  // --- BLOCK HANDLING ---
  const handleAddBlock = (block) => {
    if (gameOver) return;
    setAssembled((prev) => [...prev, block]);
  };

  const handleRemoveBlock = (index) => {
    if (gameOver) return;
    setAssembled((prev) => prev.filter((_, i) => i !== index));
  };

  const isValidAssembly = (blocks) => {
    const flat = currentFunction.flat();
    return blocks.length === flat.length && blocks.every((b, i) => b === flat[i]);
  };

  // --- MAIN ATTACK SEQUENCE ---
  const handleAttack = async () => {
    if (gameOver) return;

    if (!assembled.length) {
      setFeedback("❌ No code assembled!");
      return;
    }

    if (!isValidAssembly(assembled)) {
      setFeedback("❌ Incorrect function!");
      setAssembled([]);
      return;
    }

    const dmg = assembled.length * 2;

    // --- PLAYER ATTACK ---
    setFeedback(`⚔️ You attack for ${dmg}`);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    setPlayerSprite("/images/spriteedit.gif");

    await sleep(600);

    setEnemyHit(true);
    let nextEnemyHP;
    setEnemyHP((hp) => {
      nextEnemyHP = Math.max(0, hp - dmg);
      return nextEnemyHP;
    });

    await sleep(300);
    setEnemyHit(false);

    await sleep(400);
    setPlayerSprite("/images/idleedit2.png");

    // --- ENEMY DEAD ---
    if (nextEnemyHP <= 0) {
      setFeedback("💥 Enemy defeated!");
      setGameOver(true);
      if (onNext) onNext(dmg);
      return;
    }

    // --- ENEMY TURN ---
    const enemyDmg = Math.floor(Math.random() * 6) + 3;

    setFeedback("🐛 Enemy attacks!");
    setEnemySprite("/images/enemyattack.webm");

    await sleep(600);

    setPlayerHit(true);
    let nextPlayerHP;
    setPlayerHP((hp) => {
      nextPlayerHP = Math.max(0, hp - enemyDmg);
      return nextPlayerHP;
    });

    await sleep(300);
    setPlayerHit(false);

    await sleep(400);
    setEnemySprite("/images/enemy_idle(1).png");

    if (nextPlayerHP <= 0) {
      setFeedback("💀 You were defeated!");
      setGameOver(true);
      return;
    }

    setFeedback(`⚔️ You dealt ${dmg}, enemy dealt ${enemyDmg}`);
    generateNewFunction();
  };

  // --- RENDER SPRITE ---
  const renderSprite = (src, size) => {
    if (src.endsWith(".webm")) {
      return (
        <video
          key={src} // ✅ force restart animation
          src={src}
          width={size}
          height={size}
          autoPlay
          muted
          playsInline
        />
      );
    }
    return <img src={src} width={size} height={size} alt="" />;
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "white" }}>
        <h2>⚙️ Loading Battle...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🐛 CodeWorm Battle</h2>
      <h4>{feedback || "Assemble code to attack!"}</h4>

      {/* BATTLE FIELD */}
      <div
        style={{
          position: "relative",
          width: 650,
          height: 350,
          margin: "0 auto 20px",
          background: "#414041",
        }}
      >
        {/* PLAYER */}
        <div style={{ position: "absolute", bottom: 10, left: "30%" }}>
          <div style={{ position: "relative", width: PLAYER_SIZE, height: PLAYER_SIZE }}>
            {renderSprite(playerSprite, PLAYER_SIZE)}
            {playerHit && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,0,0,0.4)"
              }} />
            )}
          </div>
          <p style={{ color: "white" }}>HP: {playerHP}</p>
        </div>

        {/* ENEMY */}
        <div style={{ position: "absolute", bottom: 10, right: "25%" }}>
          <div style={{ position: "relative", width: ENEMY_SIZE, height: ENEMY_SIZE }}>
            {renderSprite(enemySprite, ENEMY_SIZE)}
            {enemyHit && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,0,0,0.4)"
              }} />
            )}
          </div>
          <p style={{ color: "white" }}>HP: {enemyHP}</p>
        </div>
      </div>

      {/* BLOCKS */}
      <div style={{ minHeight: 50, border: "2px dashed #ccc", padding: 10 }}>
        {assembled.map((b, i) => (
          <span key={i} onClick={() => handleRemoveBlock(i)} style={{ margin: 4, cursor: "pointer" }}>
            {b}
          </span>
        ))}
      </div>

      {/* BANK */}
      <div style={{ marginTop: 10 }}>
        {bank.map((b, i) => (
          <button key={i} onClick={() => handleAddBlock(b)}>
            {b}
          </button>
        ))}
      </div>

      <button onClick={handleAttack} disabled={gameOver} style={{ marginTop: 16 }}>
        ⚔️ Attack
      </button>
    </div>
  );
}
