import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const [enemyHP, setEnemyHP] = useState(50);
  const [playerHP, setPlayerHP] = useState(40);
  const [assembled, setAssembled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [flash, setFlash] = useState(false);
  const [shuffledBank, setShuffledBank] = useState([]);
  const [isAttacking, setIsAttacking] = useState(false);

  const playerIdle = "/images/idle.png";
  const playerAttack = "/images/sprite.gif";
  const enemyIdle = "/images/enemy_idle.png";
  const enemyAttack = "/images/enemy2.gif";

  const [playerSprite, setPlayerSprite] = useState(playerIdle);
  const [enemySprite, setEnemySprite] = useState(enemyIdle);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const validSentences = [
    ["void attack", "(", "Player player", ",", "Enemy enemy", ")"],
    ["{", "int dmg = rand() % 6 + 5;"],
    ["if (player.weapon) {", "dmg += player.weapon.power * 2;", "}"],
    ["enemy.hp -= dmg;"],
    ["return dmg;", "}"],
  ];

  const bank = [
    ...validSentences.flat(),
    "console.log('Hello')",
    "int x = 0;",
    "while(true){}",
    "player.hp += dmg;",
    "return;",
    "if player.weapon",
    "rand(5,10)",
    "enemy = dmg;",
  ];

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    setShuffledBank(shuffleArray(bank));
  }, []);

  const handleAddBlock = (block) =>
    setAssembled((prev) => [...prev, block]);

  const handleRemoveBlock = (index) =>
    setAssembled((prev) => prev.filter((_, i) => i !== index));

  const isValidAssembly = (blocks) => {
    let i = 0;
    while (i < blocks.length) {
      let matched = false;
      for (let sentence of validSentences) {
        const slice = blocks.slice(i, i + sentence.length);
        if (
          slice.length === sentence.length &&
          slice.every((b, idx) => b === sentence[idx])
        ) {
          matched = true;
          i += sentence.length;
          break;
        }
      }
      if (!matched) return false;
    }
    return true;
  };

  const handleAttack = async () => {
    if (!assembled.length) {
      setFeedback("❌ No code assembled!");
      return;
    }

    const valid = isValidAssembly(assembled);

    let dmg = 0;
    if (valid) {
      dmg = assembled.length * 5;
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      setFeedback(`⚔️ Valid code! Damage: ${dmg}`);
    } else {
      dmg = Math.floor(Math.random() * 3) + 1;
      setFeedback(`❌ Code error! Minimal damage: ${dmg}`);
    }

    // 🔥 Player attack motion
    setPlayerSprite(playerAttack);
    setIsAttacking(true);

    await sleep(200); // forward lunge

    setIsAttacking(false);
    await sleep(600); // finish animation
    setPlayerSprite(playerIdle);

    setEnemyHP((hp) => Math.max(0, hp - dmg));

    if (enemyHP - dmg <= 0) {
      setFeedback(`💥 Enemy defeated! Damage dealt: ${dmg}`);
      if (onNext) onNext(dmg);
      return;
    }

    await sleep(300);

    // 🔥 Enemy counter
    const enemyDmg =
      assembled.length < 3
        ? Math.floor(Math.random() * 10) + 5
        : Math.floor(Math.random() * 6) + 3;

    setFeedback("🐛 Enemy counterattacks!");
    setEnemySprite(enemyAttack);
    setIsAttacking(true);

    await sleep(300);

    setIsAttacking(false);
    await sleep(600);
    setEnemySprite(enemyIdle);

    setPlayerHP((hp) => Math.max(0, hp - enemyDmg));

    if (playerHP - enemyDmg <= 0) {
      setFeedback("💀 You were defeated!");
      return;
    }

    setFeedback(
      `⚔️ Turn complete! You dealt ${dmg}, enemy dealt ${enemyDmg}.`
    );

    setAssembled([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🐛 CodeWorm Battle</h2>
      <h4>{feedback || "Assemble blocks to attack!"}</h4>

      {/* 🔥 BATTLEFIELD */}
      <div
        style={{
          position: "relative",
          width: 500,
          height: 260,
          margin: "0 auto 20px auto",
          border: "3px solid #333",
          borderRadius: 10,
          overflow: "hidden",
          background: "#222",
          boxShadow: flash ? "0 0 20px red inset" : "none",
          transition: "0.2s",
        }}
      >
        {/* Player */}
        <img
          src={playerSprite}
          alt="player"
          style={{
            position: "absolute",
            left: isAttacking ? 140 : 60,
            bottom: 0,
            width: 250,
            height: 250,
            zIndex: 2,
            transition: "left 0.2s ease",
          }}
        />

        {/* Enemy */}
        <img
          src={enemySprite}
          alt="enemy"
          style={{
            position: "absolute",
            right: isAttacking ? 140 : 60,
            bottom: 0,
            width: 250,
            height: 250,
            zIndex: 1,
            transform: "scaleX(-1)",
            transition: "right 0.2s ease",
          }}
        />

        {/* HP */}
        <div style={{ position: "absolute", left: 10, top: 10, color: "#fff" }}>
          Player HP: {playerHP}
        </div>
        <div style={{ position: "absolute", right: 10, top: 10, color: "#fff" }}>
          Enemy HP: {Math.round(enemyHP)}
        </div>
      </div>

      {/* Assembled code */}
      <div
        style={{
          minHeight: 50,
          border: "2px dashed #ccc",
          padding: 10,
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {assembled.map((block, i) => (
          <div
            key={i}
            onClick={() => handleRemoveBlock(i)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "monospace",
              background: "#0c5b0bff",
              color: "white",
            }}
          >
            {block}
          </div>
        ))}
      </div>

      {/* Bank */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: 10,
          background: "#eee",
          borderRadius: 8,
        }}
      >
        {shuffledBank.map((block, i) => (
          <div
            key={i}
            onClick={() => handleAddBlock(block)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #333",
              background: "#0c5b0bff",
              color: "white",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            {block}
          </div>
        ))}
      </div>

      <button
        onClick={handleAttack}
        style={{
          marginTop: 16,
          padding: "8px 16px",
          background: "#4caf50",
          color: "#fff",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
        }}
      >
        ⚔️ Attack!
      </button>
    </div>
  );
}
