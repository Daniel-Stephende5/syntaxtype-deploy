export const quizTitle = "Syntax Saver Challenge";
const generateSlots = (answer) => {
  return answer.split("").map(() => "");
};
export const lessons = [
  {
    id: 1,
    type: "match",
    question: "Which keyword declares a constant value?",
    options: ["var", "let", "const", "function"],
    correct: "const"
  },
  {
    id: 2,
    type: "reorder",
    question: "Reorder the code blocks to create a valid function:",
    parts: [
        "function",
  "greet",
  "(",
  "name",
  ")",
  "{",
  "return Hello + name",
  ";",
  "}"

    ],
    correctOrder: [0, 1, 2]
  },
  
  
  
 {
    id: 3,
type: "battle",
question: "Defeat the CodeWorm by assembling the attack function correctly!",

// Correct blocks (longer but still structured)
blocks: [
  "function attack(player, enemy) {",
  "int dmg = random(5,10);",
  "if (player.weapon) {",
  "dmg += player.weapon.power * 2;",
  "}",
  "if (Math.random() < 0.2) {",
  "dmg *= 1.5; // critical hit",
  "}",
  "dmg += player.level * 1.5;",
  "enemy.hp -= dmg;",
  "return dmg;",
  "}"
],

// Partial / alternate phrases (still useful for scoring)
alternateBlocks: [
  "function attack(player, enemy) {",
  "int dmg = random(5,10);",
  "if (player.weapon) { dmg += player.weapon.power * 2; }",
  "if (Math.random() < 0.2) { dmg *= 1.5; }",
  "enemy.hp -= dmg;",
  "return dmg;"
],

// Scrambled bank (atomic + junk blocks)
scrambled: [
  "function attack(player, enemy) {",
  "int dmg = random(5,10);",
  "if (player.weapon) {",
  "dmg += player.weapon.power * 2;",
  "}",
  "if (Math.random() < 0.2) {",
  "dmg *= 1.5; // critical hit",
  "}",
  "dmg += player.level * 1.5;",
  "enemy.hp -= dmg;",
  "return dmg;",
  "}",
  "for (int i=0; i<10; i++) {}",
  "console.log('Attack!');",
  "int x = 0;",
  "dmg += 1;"
    ]
  }
  
];

export const fourPicsOneWordData = [
  
  {
    id: 1,
    answer: "ARRAY",
    images: [
      "/images/array.jpg",
      
    ],
    hint: "Stores multiple values in order",
    letters: "R E Y A O F D A R T A M A P A".split(" "), // can form DATA, MAP
    slots: generateSlots("ARRAY"),
  },
  {
    id: 2,
    answer: "CONDITION",
    images: [
      "/images/condition.jpg",
      
    ],
    hint: "Decision-making in code",
    letters: "C O A L N D I E T W I O N C O D E I F".split(" "), // CODE, IF
    slots: generateSlots("CONDITION"),
  },
  {
    id: 3,
    answer: "DATATYPE",
    images: [
      "/images/datatype.jpg",
      
    ],
    hint: "Defines what kind of data",
    letters: " P A T T Y E T Y P O E C D A E D".split(" "), // TYPE, CODE
    slots: generateSlots("DATATYPE"),
  },
  {
    id: 4,
    answer: "FUNCTION",
    images: [
      "/images/function.jpg",
      
    ],
    hint: "Reusable block of code",
    letters: "Y U A N C T I F U O N R U N C O D E".split(" "), // RUN, CODE
    slots: generateSlots("FUNCTION"),
  },
  {
    id: 5,
    answer: "RECURSION",
    images: [
      "/images/recursion.jpg",
      
    ],
    hint: "A function that calls itself",
    letters: "E P R A C I R S I V U N C O R E R U N".split(" "), // CORE, RUN
    slots: generateSlots("RECURSION"),
  },
  {
    id: 6,
    answer: "STRUCTURE",
    images: [
      "/images/structure.jpg",
     
    ],
    hint: "Organized grouping of data",
    letters: " T R U C K T U R A U S E R T S R E E".split(" "), // USER, TREE
    slots: generateSlots("STRUCTURE"),
  },
  {
    id: 7,
    answer: "VARIABLE",
    images: [
      "/images/variable.png",
      
    ],
    hint: "Stores a value that can change",
    letters: "V A L U E R B A B L E V A T U E I B I T".split(" "), // VALUE, BIT
    slots: generateSlots("VARIABLE"),
  },
  {
    id: 8,
    answer: "MAIN",
    images: [
      "/images/main.png",
      
    ],
    hint: "Program entry point",
    letters: "M A N Y I N C O D E R U N A P P".split(" "), // CODE, RUN, APP
    slots: generateSlots("MAIN"),
  },
  {
    id: 9,
    answer: "POINTER",
    images: [
      "/images/pointer.jpg",
      
    ],
    hint: "Stores an address",
    letters: "U S I N T E P X Y R N O O A E R A M".split(" "), // NODE, RAM
    slots: generateSlots("POINTER"),
  },
  {
    id: 10,
    answer: "MEMORY",
    images: [
      "/images/memory.png",
     
    ],
    hint: "continuos block of bytes",
    letters: "Y M A R W H P L M E D A O O".split(" "), // FOR, WHILE, DO
    slots: generateSlots("MEMORY"),
  },
];
