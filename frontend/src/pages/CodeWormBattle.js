import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const [loading, setLoading] = useState(true); // ✅ added

  const [enemyHP, setEnemyHP] = useState(50);
  const [playerHP, setPlayerHP] = useState(40);
  const [assembled, setAssembled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [flash, setFlash] = useState(false);
  const [playerAnimation, setPlayerAnimation] = useState("idle");
  const [enemyAnimation, setEnemyAnimation] = useState("idle");
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // ✅ PRELOAD ASSETS
  const preloadAssets = async () => {
    const assets = [
      "/images/idleedit2.png",
      "/images/spriteedit.webm",
      "/images/idledamage.png",
      "/images/enemy_idle(1).png",
      "/images/enemy_idle(damage).png",
      "/images/enemyattack.webm",
    ];

    const promises = assets.map((src) => {
      return new Promise((resolve) => {
        const ext = src.split(".").pop();

        if (ext === "webm") {
          const video = document.createElement("video");
          video.src = src;
          video.onloadeddata = resolve;
        } else {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
        }
      });
    });

    await Promise.all(promises);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const validFunctions = [
    [
      ["void special attack", "(", "Player player", ",", "Enemy enemy", ")"],
      ["{"],
      ["int dmg = rand() % 6 + 5;"],
      ["if (player.weapon) {", "dmg += player.weapon.power * 2;", "}"],
      ["enemy.hp -= dmg;"],
      ["if (enemy.hp <= 0) {", "printf(\"Enemy defeated!\\n\");", "}"],
      ["return dmg;"],
      ["}"],
    ],
    [
      ["void doubleStrike", "(", "Player player", ",", "Enemy enemy", ")"],
      ["{"],
      ["int dmg1 = rand() % 4 + 3;"],
      ["int dmg2 = rand() % 4 + 3;"],
      ["enemy.hp -= (dmg1 + dmg2);"],
      ["printf(\"Double strike dealt %d damage!\\n\", dmg1 + dmg2);"],
      ["return;"],
      ["}"],
    ],
    [
      ["void attack", "(", "Player player", ")"],
      ["{"],
      ["int dmgAmount = rand() % 10 + 5;"],
      ["player.hp += dmgAmount;"],
      ["printf(\"Player attacks for %d damage\\n\", dmgAmount);"],
      ["return;"],
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

  // ✅ INIT WITH LOADING
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        preloadAssets(),
        new Promise((res) => setTimeout(res, 400)), // smooth feel
      ]);

      generateNewFunction();
      setLoading(false);
    };

    init();
  }, []);

  const handleAddBlock = (block) => {
    if (gameOver) return;
    setAssembled((prev) => [...prev, block]);
  };

  const handleRemoveBlock = (index) => {
    if (gameOver) return;
    setAssembled((prev) => prev.filter((_, i) => i !== index));
  };

  const isValidAssembly = (blocks) => {
    const flatFunc = currentFunction.flat();
    if (blocks.length !== flatFunc.length) return false;
    return blocks.every((b, i) => b === flatFunc[i]);
  };

  const handleAttack = async () => {
    if (gameOver) return;
    if (!assembled.length) {
      setFeedback("❌ No code assembled!");
      return;
    }

    const valid = isValidAssembly(assembled);
    if (!valid) {
      setFeedback("❌ Incorrect function! No attack!");
      setAssembled([]);
      return;
    }

    const dmg = assembled.length * 2;
    setFeedback(`⚔️ Function correct! Damage: ${dmg}`);
    setFlash(true);
    setTimeout(() => setFlash(false), 500);

    setPlayerAnimation("attack");
    await sleep(1200);
    setPlayerAnimation("idle");

    setEnemyHit(true);
    let nextEnemyHP;
    setEnemyHP((hp) => {
      nextEnemyHP = Math.max(0, hp - dmg);
      return nextEnemyHP;
    });
    await sleep(400);
    setEnemyHit(false);

    if (nextEnemyHP <= 0) {
      setFeedback(`💥 Enemy defeated! Damage dealt: ${dmg}`);
      setGameOver(true);
      if (onNext) onNext(dmg);
      return;
    }

    const enemyDmg = Math.floor(Math.random() * 6) + 3;
    setFeedback("🐛 Enemy counterattacks!");
    setEnemyAnimation("attack");
    await sleep(900);
    setEnemyAnimation("idle");

    setPlayerHit(true);
    let nextPlayerHP;
    setPlayerHP((hp) => {
      nextPlayerHP = Math.max(0, hp - enemyDmg);
      return nextPlayerHP;
    });
    await sleep(400);
    setPlayerHit(false);

    if (nextPlayerHP <= 0) {
      setFeedback("💀 You were defeated!");
      setGameOver(true);
      return;
    }

    setFeedback(`⚔️ Turn complete! You dealt ${dmg}, enemy dealt ${enemyDmg}.`);
    if (!gameOver) generateNewFunction();
  };

  const getPlayerSprite = () =>
    playerAnimation === "idle"
      ? "/images/idleedit2.png"
      : "/images/spriteedit.webm";

  const getEnemySprite = () =>
    enemyAnimation === "idle"
      ? "/images/enemy_idle(1).png"
      : "/images/enemyattack.webm";

  // ✅ LOADING SCREEN
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <h2>🐛 Loading Battle...</h2>
        <p>Preparing assets...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🐛 CodeWorm Battle</h2>
      <h4>{feedback || "Assemble the function blocks correctly to attack!"}</h4>

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
        <div style={{ position: "absolute", bottom: 10, left: "30%" }}>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            {playerAnimation === "idle" ? (
              <img src={getPlayerSprite()} width={250} height={250} alt="player" />
            ) : (
              <video src={getPlayerSprite()} width={250} height={250} autoPlay muted playsInline />
            )}
            {playerHit && (
              <img
                src="/images/idledamage.png"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                alt=""
              />
            )}
          </div>
          <p style={{ color: "white" }}>HP: {playerHP}</p>
        </div>

        {/* ENEMY */}
        <div style={{ position: "absolute", bottom: 10, right: "25%" }}>
          <div style={{ position: "relative", width: 250, height: 250 }}>
            {enemyAnimation === "idle" ? (
              <img src={getEnemySprite()} width={250} height={250} alt="enemy" />
            ) : (
              <video src={getEnemySprite()} width={250} height={250} autoPlay muted playsInline />
            )}
            {enemyHit && (
              <img
                src="/images/enemy_idle(damage).png"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                alt=""
              />
            )}
          </div>
          <p style={{ color: "white" }}>HP: {enemyHP}</p>
        </div>
      </div>

      {/* (Your block UI unchanged) */}

      {/* ... keep everything else exactly the same ... */}
    </div>
  );
}
