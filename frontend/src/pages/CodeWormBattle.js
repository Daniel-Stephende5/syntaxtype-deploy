import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const PLAYER_SIZE = 250;
  const ENEMY_SIZE = 250;

  const [enemyHP, setEnemyHP] = useState(50);
  const [playerHP, setPlayerHP] = useState(40);
  const [assembled, setAssembled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [playerSprite, setPlayerSprite] = useState("/images/idleedit2.png");
  const [enemySprite, setEnemySprite] = useState("/images/enemy_idle(1).png");
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // ✅ shuffle lines (NOT tokens)
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const validFunctions = [
    [
      ["void attack", "(", "Player player", ",", "Enemy enemy", ")"],
      ["{"],
      ["int dmg = rand() % 6 + 5;"],
      ["enemy.hp -= dmg;"],
      ['printf("Hit for %d\\n", dmg);'],
      ["return;"],
      ["}"],
    ],
  ];

  const [currentFunction, setCurrentFunction] = useState([]);
  const [bank, setBank] = useState([]);

  const generateNewFunction = () => {
    const func =
      validFunctions[Math.floor(Math.random() * validFunctions.length)];

    setCurrentFunction(func);
    setBank(shuffleArray(func)); // ✅ shuffle LINES
    setAssembled([]);
  };

  // ✅ preload
  useEffect(() => {
    const preload = async () => {
      const assets = [
        "/images/spriteedit.gif",
        "/images/idleedit2.png",
        "/images/enemy_idle(1).png",
        "/images/enemy_attack.gif",
        "/images/idledamage.png",
        "/images/enemy_idle(damage).png",
      ];

      await Promise.all(
        assets.map(
          (src) =>
            new Promise((res) => {
              const img = new Image();
              img.src = src;
              img.onload = res;
              img.onerror = res;
            })
        )
      );

      generateNewFunction();
      setLoading(false);
    };

    preload();
  }, []);

  const handleAddBlock = (block) => {
    if (!gameOver) {
      setAssembled((prev) => [...prev, block]);
    }
  };

  const handleRemoveBlock = (index) => {
    if (!gameOver) {
      setAssembled((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ✅ correct validation (line by line)
  const isValidAssembly = (blocks) => {
    if (blocks.length !== currentFunction.length) return false;

    return blocks.every(
      (line, i) =>
        JSON.stringify(line) === JSON.stringify(currentFunction[i])
    );
  };

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
    setFeedback(`⚔️ Correct! Damage: ${dmg}`);

    // 🟢 Player attack
    setPlayerSprite("/images/spriteedit.gif");
    await sleep(700);

    setEnemyHit(true);
    const newEnemyHP = Math.max(0, enemyHP - dmg);
    setEnemyHP(newEnemyHP);

    await sleep(400);
    setEnemyHit(false);
    setPlayerSprite("/images/idleedit2.png");

    if (newEnemyHP <= 0) {
      setFeedback("💥 Enemy defeated!");
      setGameOver(true);
      onNext && onNext(dmg);
      return;
    }

    // 🔴 Enemy attack
    const enemyDmg = Math.floor(Math.random() * 6) + 3;
    setEnemySprite("/images/enemy_attack.gif");
    setFeedback("🐛 Enemy attacks!");

    await sleep(700);

    setPlayerHit(true);
    const newPlayerHP = Math.max(0, playerHP - enemyDmg);
    setPlayerHP(newPlayerHP);

    await sleep(400);
    setPlayerHit(false);
    setEnemySprite("/images/enemy_idle(1).png");

    if (newPlayerHP <= 0) {
      setFeedback("💀 You lost!");
      setGameOver(true);
      return;
    }

    setFeedback(`⚔️ You: ${dmg} | Enemy: ${enemyDmg}`);
    generateNewFunction();
  };

  if (loading) {
    return <h2 style={{ padding: 20 }}>Loading assets...</h2>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🐛 CodeWorm Battle</h2>
      <h4>{feedback || "Assemble the function correctly!"}</h4>

      {/* Arena */}
      <div
        style={{
          width: 650,
          height: 350,
          margin: "auto",
          background: "#414041",
          position: "relative",
          borderRadius: 10,
        }}
      >
        {/* Player */}
        <div style={{ position: "absolute", bottom: 10, left: "25%" }}>
          <img src={playerSprite} width={PLAYER_SIZE} alt="player" />
          {playerHit && (
            <img
              src="/images/idledamage.png"
              width={PLAYER_SIZE}
              style={{ position: "absolute", top: 0, left: 0 }}
              alt=""
            />
          )}
          <p style={{ color: "#fff" }}>HP: {playerHP}</p>
        </div>

        {/* Enemy */}
        <div style={{ position: "absolute", bottom: 10, right: "25%" }}>
          <img src={enemySprite} width={ENEMY_SIZE} alt="enemy" />
          {enemyHit && (
            <img
              src="/images/enemy_idle(damage).png"
              width={ENEMY_SIZE}
              style={{ position: "absolute", top: 0, left: 0 }}
              alt=""
            />
          )}
          <p style={{ color: "#fff" }}>HP: {enemyHP}</p>
        </div>
      </div>

      {/* ✅ Assembled */}
      <div
        style={{
          minHeight: 60,
          border: "2px dashed #ccc",
          padding: 10,
          marginTop: 10,
        }}
      >
        {assembled.map((line, i) => (
          <div
            key={i}
            onClick={() => handleRemoveBlock(i)}
            style={{
              marginBottom: 4,
              cursor: "pointer",
              background: "#0c5b0b",
              color: "#fff",
              padding: 6,
              borderRadius: 4,
            }}
          >
            {line.join(" ")}
          </div>
        ))}
      </div>

      {/* ✅ Bank */}
      <div style={{ marginTop: 10 }}>
        {bank.map((line, i) => (
          <button
            key={i}
            onClick={() => handleAddBlock(line)}
            style={{ display: "block", marginBottom: 5 }}
          >
            {line.join(" ")}
          </button>
        ))}
      </div>

      <button onClick={handleAttack} disabled={gameOver}>
        ⚔️ Attack
      </button>
    </div>
  );
}
