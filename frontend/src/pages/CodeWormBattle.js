import React, { useState, useEffect } from "react";

export default function CodeWormBattle({ onNext }) {
  const PLAYER_SIZE = 250;
  const ENEMY_SIZE = 250;

  const [loading, setLoading] = useState(true); // ✅ NEW

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

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // ✅ PRELOAD ASSETS
  const preloadAssets = async () => {
    const assets = [
      "/images/idleedit2.png",
      "/images/spriteedit.gif",
      "/images/idledamage.png",
      "/images/enemy_idle(1).png",
      "/images/enemy_idle(damage).png",
      "/images/enemyattack.gif",
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
        new Promise((res) => setTimeout(res, 500)), // smooth loading feel
      ]);

      generateNewFunction();
      setLoading(false);
    };

    init();
  }, []);

  const handleAddBlock = (block) => {
    if (!gameOver) setAssembled((prev) => [...prev, block]);
  };

  const handleRemoveBlock = (index) => {
    if (!gameOver) {
      setAssembled((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const isValidAssembly = (blocks) => {
    const flatFunc = currentFunction.flat();
    return blocks.length === flatFunc.length &&
           blocks.every((b, i) => b === flatFunc[i]);
  };

  const handleAttack = async () => {
    if (gameOver) return;

    if (!assembled.length) {
      setFeedback("❌ No code assembled!");
      return;
    }

    if (!isValidAssembly(assembled)) {
      setFeedback("❌ Incorrect function! No attack!");
      setAssembled([]);
      return;
    }

    const dmg = assembled.length * 2;
    setFeedback(`⚔️ Function correct! Damage: ${dmg}`);
    setFlash(true);
    setTimeout(() => setFlash(false), 500);

    setPlayerSprite("/images/spriteedit.gif");

    const hitTime = 800;
    const totalDuration = 1200;
    let nextEnemyHP;

    setTimeout(() => {
      setEnemyHit(true);
      setEnemyHP((hp) => {
        nextEnemyHP = Math.max(0, hp - dmg);
        return nextEnemyHP;
      });
    }, hitTime);

    setTimeout(() => setEnemyHit(false), hitTime + 400);
    setTimeout(() => setPlayerSprite("/images/idleedit2.png"), totalDuration);

    await sleep(totalDuration);

    if (nextEnemyHP <= 0) {
      setFeedback(`💥 Enemy defeated!`);
      setGameOver(true);
      onNext?.(dmg);
      return;
    }

    // Enemy turn
    const enemyDmg = Math.floor(Math.random() * 6) + 3;
    setFeedback("🐛 Enemy counterattacks!");
    setEnemySprite("/images/enemyattack.webm");

    await sleep(900);

    setPlayerHit(true);
    let nextPlayerHP;

    setPlayerHP((hp) => {
      nextPlayerHP = Math.max(0, hp - enemyDmg);
      return nextPlayerHP;
    });

    await sleep(400);
    setPlayerHit(false);

    await sleep(700);
    setEnemySprite("/images/enemy_idle(1).png");

    if (nextPlayerHP <= 0) {
      setFeedback("💀 You were defeated!");
      setGameOver(true);
      return;
    }

    setFeedback(`⚔️ Turn complete!`);
    generateNewFunction();
  };

  const renderSprite = (src, size) => {
    const ext = src.split(".").pop();

    return ext === "webm" ? (
      <video src={src} width={size} height={size} autoPlay muted playsInline />
    ) : (
      <img src={src} width={size} height={size} alt="sprite" />
    );
  };

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

      <div style={{
        position: "relative",
        width: 650,
        height: 350,
        margin: "0 auto 20px",
        border: "2px solid #333",
        borderRadius: 12,
        background: "#414041"
      }}>
        {/* Player */}
        <div style={{ position: "absolute", bottom: 10, left: "30%" }}>
          {renderSprite(playerSprite, PLAYER_SIZE)}
          <p style={{ color: "white" }}>HP: {playerHP}</p>
        </div>

        {/* Enemy */}
        <div style={{ position: "absolute", bottom: 10, right: "25%" }}>
          {renderSprite(enemySprite, ENEMY_SIZE)}
          <p style={{ color: "white" }}>HP: {enemyHP}</p>
        </div>
      </div>

      {/* Blocks */}
      <div style={{ minHeight: 50, marginBottom: 16 }}>
        {assembled.map((b, i) => (
          <span key={i} onClick={() => handleRemoveBlock(i)}>
            {b}{" "}
          </span>
        ))}
      </div>

      <div>
        {bank.map((b, i) => (
          <button key={i} onClick={() => handleAddBlock(b)}>
            {b}
          </button>
        ))}
      </div>

      <button onClick={handleAttack} disabled={gameOver}>
        ⚔️ Attack!
      </button>
    </div>
  );
}
