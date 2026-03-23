// GalaxyLibrary.js

// ✅ Normal typing enemies (short C snippets)
export const easyEnemies = [
  { type: "typing", word: "int x = 5;", speed: 40 },
  { type: "typing", word: "const float pi = 3.14;", speed: 45 },
  { type: "typing", word: "if (hp <= 0)", speed: 50 },
  { type: "typing", word: "return 0;", speed: 50 },
  { type: "typing", word: "char c = 'A';", speed: 48 },
  { type: "typing", word: "float score = 100.0;", speed: 46 },
  { type: "typing", word: "bool alive = true;", speed: 45 },
  { type: "typing", word: "void reset();", speed: 42 },
  { type: "typing", word: "double distance = 0.0;", speed: 44 },
];

// ✅ Shield enemies with single concept
export const shieldEnemies = [
  {
    type: "shield",
    word: "int dmg = rand() % 6 + 5;",
    speed: 35,
    questions: [
      { prompt: "Keyword to declare integer in C", answer: "int" },
    ],
  },
  {
    type: "shield",
    word: "printf(\"Damage dealt\");",
    speed: 32,
    questions: [
      { prompt: "Function to print output in C", answer: "printf" },
    ],
  },
  {
    type: "shield",
    word: "for (int i = 0; i < 10; i++) {}",
    speed: 30,
    questions: [
      { prompt: "Keyword used to repeat code multiple times", answer: "for" },
    ],
  },
  {
    type: "shield",
    word: "while (player.hp > 0) {}",
    speed: 28,
    questions: [
      { prompt: "Keyword for loop with condition", answer: "while" },
    ],
  },
  {
    type: "shield",
    word: "switch(option) { case 1: break; }",
    speed: 30,
    questions: [
      { prompt: "Keyword for multiple-choice branching", answer: "switch" },
    ],
  },
];
export const bossEnemy = {
  type: "shield",
  word: `void ultimateAttack(Player* p) {
  if (p->hp > 0) {
    p->hp -= 50;
  }
}`,
  speed: 18,
  questions: [
    { prompt: "Keyword for function with no return", answer: "void" },
    
  ],
  spawnInterval: 60000, // 60 sec
  lastSpawn: 0,
};

// ✅ Boss enemy with multiple shields & code snippet as word
export const bossEnemy2 = {
  type: "shield",
  word: `int calculateDamage(Player player, Enemy enemy) {
  int base = rand() % 6 + 5;
  if (player.weapon) base += player.weapon.power * 2;
  return base;
}`,
  speed: 15,
  questions: [
    { prompt: "Keyword for if-statement", answer: "if" },
    { prompt: "Random number function in C", answer: "rand" },
  ],
  spawnInterval: 90000, // Boss appears every 90 seconds
  lastSpawn: 0,         // Timestamp tracker
};


// --- Combined library based on level ---
// GalaxyLibrary.js

export function getEnemiesByLevel(currentTime = 0) {
  const enemies = [];
  
  // 🔥 Check Boss 1 (60s)
  if (currentTime - (bossEnemy.lastSpawn || 0) >= 60000) {
    bossEnemy.lastSpawn = currentTime;
    // Return ONLY the boss to signal a phase shift
    return [{ ...bossEnemy, type: "boss" }]; 
  }

  // 🔥 Check Boss 2 (90s)
  if (currentTime - (bossEnemy2.lastSpawn || 0) >= 90000) {
    bossEnemy2.lastSpawn = currentTime;
    return [{ ...bossEnemy2, type: "boss" }];
  }

  // Normal spawn if no boss is due
  const spawnPool = [...easyEnemies, ...shieldEnemies];
  const randomIndex = Math.floor(Math.random() * spawnPool.length);
  enemies.push({ ...spawnPool[randomIndex] });

  return enemies;
}
