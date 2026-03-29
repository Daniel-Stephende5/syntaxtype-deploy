import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const [enemyHP, setEnemyHP] = useState(50);
  const [playerHP, setPlayerHP] = useState(40);
  const [assembled, setAssembled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [flash, setFlash] = useState(false);
  const [shuffledBank, setShuffledBank] = useState([]);

  const [enemyHit, setEnemyHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

  const playerIdle = "/images/idleedit2.png";
  const playerAttack = "/images/spriteedit.gif";
  const enemyIdle = "/images/enemy_idle(1).png";
  const enemyAttack = "/images/enemyattack.gif";

  const playerDamageImg = "/images/idledamage.png";
  const enemyDamageImg = "/images/enemy_idle(damage).png";

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

  useEffect(() => {
    setShuffledBank([...bank].sort(() => Math.random() - 0.5));
  }, []);

  const handleAddBlock = (block) => {
    if (isGameOver()) return;
    setAssembled((prev) => [...prev, block]);
  };
  const handleRemoveBlock = (index) => {
    if (isGameOver()) return;
    setAssembled((prev) => prev.filter((_, i) => i !== index));
  };

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

  const isGameOver = () => playerHP <= 0 || enemyHP <= 0;

  const handleAttack = async () => {
    if (isGameOver()) return; // no more actions

    if (!assembled.length) {
      setFeedback("❌ No code assembled!");
      return;
    }

    const valid = isValidAssembly(assembled);
    let dmg = valid ? assembled.length * 5 : Math.floor(Math.random() * 3) + 1;

    if (valid) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setFeedback(`⚔️ Valid code! Damage: ${dmg}`);
    } else {
      setFeedback(`❌ Code error! Minimal damage: ${dmg}`);
    }

    setPlayerSprite(playerAttack);

    setTimeout(() => {
      setEnemyHit(true);
      setEnemyHP((hp) => Math.max(0, hp - dmg));
      setTimeout(() => setEnemyHit(false), 600);
    }, 700);

    await sleep(1000);
    setPlayerSprite(playerIdle);

    // Check enemy defeat
    if (enemyHP - dmg <= 0) {
      setFeedback(`💥 Enemy defeated! Damage dealt: ${dmg}`);
      if (onNext) onNext(dmg);
      return;
    }

    await sleep(400);

    const enemyDmg =
      assembled.length < 3
        ? Math.floor(Math.random() * 10) + 5
        : Math.floor(Math.random() * 6) + 3;

    setFeedback("🐛 Enemy counterattacks!");
    setEnemySprite(enemyAttack);

    setTimeout(() => {
      setPlayerHit(true);
      setPlayerHP((hp) => Math.max(0, hp - enemyDmg));
      setTimeout(() => setPlayerHit(false), 600);
    }, 800);

    await sleep(2000);
    setEnemySprite(enemyIdle);

    // Check player defeat
    if (playerHP - enemyDmg <= 0) {
      setFeedback("💀 You were defeated! Game Over.");
      return;
    }

    setFeedback(`⚔️ Turn complete! You dealt ${dmg}, enemy dealt ${enemyDmg}.`);
    setAssembled([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🐛 CodeWorm Battle</h2>
      <h4>{feedback || "Assemble blocks to attack!"}</h4>

      {/* BATTLEFIELD */}
      <div
        style={{
          position: "relative",
          width: 650,
          height: 350,
          margin: "0 auto 20px",
          border: "2px solid #333",
          borderRadius: 12,
          background: "#414041",
          overflow: "hidden",
        }}
      >
        {/* PLAYER */}
        <div style={{ position: "absolute", bottom: 10, left: "30%", textAlign: "left" }}>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            <img src={playerSprite} alt="player" width={250} height={250} />
            {playerHit && (
              <img
                src={playerDamageImg}
                alt="player damage"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
          <p style={{ color: "white" }}>HP: {playerHP}</p>
        </div>

        {/* ENEMY */}
        <div style={{ position: "absolute", bottom: 10, right: "25%", textAlign: "right" }}>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            <img src={enemySprite} alt="enemy" width={250} height={250} />
            {enemyHit && (
              <img
                src={enemyDamageImg}
                alt="enemy damage"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
          <p style={{ color: "white" }}>HP: {Math.round(enemyHP)}</p>
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
          opacity: isGameOver() ? 0.6 : 1, // grey out when game over
          pointerEvents: isGameOver() ? "none" : "auto",
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
          opacity: isGameOver() ? 0.6 : 1,
          pointerEvents: isGameOver() ? "none" : "auto",
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
        disabled={isGameOver()} // disable attack if game over
        style={{
          marginTop: 16,
          padding: "8px 16px",
          background: "#4caf50",
          color: "#fff",
          borderRadius: 6,
          border: "none",
          cursor: isGameOver() ? "not-allowed" : "pointer",
          opacity: isGameOver() ? 0.5 : 1,
        }}
      >
        ⚔️ Attack!
      </button>
    </div>
  );
}
