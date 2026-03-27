import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const [enemyHP, setEnemyHP] = useState(50);
  const [playerHP, setPlayerHP] = useState(40);
  const [assembled, setAssembled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [flash, setFlash] = useState(false);
  const [shuffledBank, setShuffledBank] = useState([]);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);

  const playerIdle = "/images/idle.png";
  const playerAttack = "/images/sprite.gif";
  const enemyIdle = "/images/enemy_idle.png";
  const enemyAttack = "/images/enemy2.gif";

  const [playerSprite, setPlayerSprite] = useState(playerIdle);
  const [enemySprite, setEnemySprite] = useState(enemyIdle);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // Valid sentences for the code game
  const validSentences = [
    ["void attack", "(", "Player player", ",", "Enemy enemy", ")"],
    ["{", "int dmg = rand() % 6 + 5;"],
    ["if (player.weapon) {", "dmg += player.weapon.power * 2;", "}"],
    ["enemy.hp -= dmg;"],
    ["return dmg;", "}"],
  ];

  // Flatten for bank and add junk
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

  // Shuffle array
  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);
  useEffect(() => setShuffledBank(shuffleArray(bank)), []);

  const handleAddBlock = (block) => setAssembled((prev) => [...prev, block]);
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
    let dmg = valid ? assembled.length * 5 : Math.floor(Math.random() * 3) + 1;

    setFlash(valid);
    if (valid) setFeedback(`⚔️ Valid code! Damage: ${dmg}`);
    else setFeedback(`❌ Code error! Minimal damage: ${dmg}`);

    // --- Player attacks ---
    setIsPlayerAttacking(true);
    setPlayerSprite(playerAttack);
    await sleep(800);
    setPlayerSprite(playerIdle);
    setIsPlayerAttacking(false);

    setEnemyHP((hp) => Math.max(0, hp - dmg));
    if (enemyHP - dmg <= 0) {
      setFeedback(`💥 Enemy defeated! Damage dealt: ${dmg}`);
      if (onNext) onNext(dmg);
      return;
    }

    await sleep(400);

    // --- Enemy retaliates ---
    const enemyDmg =
      assembled.length < 3
        ? Math.floor(Math.random() * 10) + 5
        : Math.floor(Math.random() * 6) + 3;

    setFeedback("🐛 Enemy counterattacks!");
    setIsEnemyAttacking(true);
    setEnemySprite(enemyAttack);
    await sleep(900);
    setEnemySprite(enemyIdle);
    setIsEnemyAttacking(false);

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

      {/* Battlefield container */}
      <div
        style={{
          position: "relative",
          width: 650,
          height: 300,
          margin: "0 auto 20px",
          border: "2px solid #333",
          overflow: "hidden",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        {/* Player */}
        <div style={{ position: "absolute", left: 50, bottom: 0, textAlign: "center" }}>
          <img
            src={playerSprite}
            alt="player"
            style={{
              width: 250,
              height: 250,
              transform: `translateX(${isPlayerAttacking ? 60 : 0}px)`,
              transition: "transform 0.3s ease",
              zIndex: 2,
            }}
          />
          <p>HP: {playerHP}</p>
        </div>

        {/* Enemy */}
        <div style={{ position: "absolute", right: 50, bottom: 0, textAlign: "center" }}>
          <img
            src={enemySprite}
            alt="enemy"
            style={{
              width: 250,
              height: 250,
              transform: `translateX(${isEnemyAttacking ? -60 : 0}px) scaleX(-1)`,
              transition: "transform 0.3s ease",
              zIndex: 1,
            }}
          />
          <p>HP: {enemyHP}</p>
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
          boxShadow: flash ? "0 0 20px 5px #4caf50" : "none",
          transition: "0.2s",
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
              transition: "0.3s",
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
