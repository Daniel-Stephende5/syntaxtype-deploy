// BookwormCConcepts.jsx
import React, { useState, useEffect } from "react";

const ROWS = 12;
const COLS = 12;

// C programming concept dictionary: word -> hint/question
const C_DICTIONARY = {
  pointer: "Variable that stores the address of another variable",
  array: "Collection of elements of the same type stored in contiguous memory",
  loop: "Executes a block of code repeatedly",
  function: "Reusable block of code that can be called with parameters",
  struct: "User-defined data type to group variables",
  int: "Data type for integers",
  char: "Data type for single characters",
  float: "Data type for decimal numbers",
  double: "Data type for double-precision floating point numbers",
  printf: "Function to print output to the console",
  scanf: "Function to read input from the user",
  null: "Represents a pointer that points to nothing",
  const: "Keyword for defining a value that cannot change",
  break: "Exits a loop or switch statement",
  continue: "Skips the current loop iteration",
  typedef: "Keyword to create an alias for a type",
  enum: "User-defined type with named integer constants",
  return: "Exits a function and optionally returns a value",
  main: "The entry point of a C program",
  include: "Directive to include libraries or headers",
  switch: "Multi-way branch statement",
  case: "Label within a switch statement",
  default: "Default label in a switch statement",
  if: "Executes a block of code if condition is true",
  else: "Executes a block of code if condition is false",
  while: "Loop that executes while a condition is true",
  for: "Loop with initialization, condition, and increment",
  do: "Loop that executes at least once before checking condition",
  void: "Specifies a function returns nothing",
  static: "Keyword for local persistence or limited visibility",
  extern: "Specifies a variable or function exists elsewhere",
  sizeof: "Operator to get the size of a type or variable",
  volatile: "Keyword telling compiler variable may change unexpectedly",
  register: "Suggests variable be stored in CPU register",
  goto: "Jumps to a labeled statement (generally discouraged)",
  signed: "Specifies signed integer type",
  unsigned: "Specifies unsigned integer type",
  union: "User-defined type storing different data types in same memory",
  file: "Represents a file pointer for I/O operations",
  fopen: "Function to open a file",
  fclose: "Function to close a file",
  fread: "Function to read from a file",
  fwrite: "Function to write to a file",
  malloc: "Allocates memory dynamically",
  free: "Frees dynamically allocated memory",
  realloc: "Resizes previously allocated memory",
  exit: "Terminates a program",
  assert: "Macro to test assumptions at runtime",
  getchar: "Reads a single character from stdin",
  putchar: "Writes a single character to stdout",
  strtok: "Tokenizes a string into smaller strings",
  strcmp: "Compares two strings",
  strcpy: "Copies one string to another",
  strcat: "Concatenates two strings",
  strlen: "Returns length of a string",
  errno: "Global variable for error reporting",
  stderr: "Standard error stream",
  stdin: "Standard input stream",
  stdout: "Standard output stream",
  bitwise: "Operations using &, |, ^, ~, <<, >>",
  shift: "Left or right bitwise operation",
  operator: "Symbol performing computation (+, -, *, /, etc.)",
  macro: "Preprocessor directive defining reusable code snippet",
  preprocessor: "Processor that handles directives before compilation"
};

// Convert dictionary keys to array
const WORDS = Object.keys(C_DICTIONARY);

// Weighted English letters (for random tiles)
const LETTER_BAG = "eeeeeeeeaaaaaaaaooooooiiiiiinnnnssrrttlldcugmbfywkpvzxjq".split("");

// Helpers
function randLetter() {
  return LETTER_BAG[Math.floor(Math.random() * LETTER_BAG.length)].toUpperCase();
}

function makeEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ""));
}

function getRandomWords(n = 10) {
  const shuffled = WORDS.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function generateRandomQuestions() {
  const shuffled = Object.entries(C_DICTIONARY).sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
}

// Create board with seeded C concept words
function makeCBoard() {
  const board = makeEmptyBoard();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      board[r][c] = randLetter();
    }
  }

  const wordsToPlace = getRandomWords(10).map(w => w.toUpperCase());
  const placed = [];

  for (const word of wordsToPlace) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);

      if ((horizontal && col + word.length > COLS) || (!horizontal && row + word.length > ROWS)) continue;

      let conflict = false;
      for (let j = 0; j < word.length; j++) {
        const r = horizontal ? row : row + j;
        const c = horizontal ? col + j : col;
        const existing = placed.find(p => p.r === r && p.c === c);
        if (existing && existing.letter !== word[j]) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      for (let j = 0; j < word.length; j++) {
        const r = horizontal ? row : row + j;
        const c = horizontal ? col + j : col;
        board[r][c] = word[j];
        placed.push({ r, c, letter: word[j] });
      }
      break;
    }
  }
  return board;
}

function deepCopyBoard(board) {
  return board.map(row => row.slice());
}

function isAdjacent(a, b) {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return (dr <= 1 && dc <= 1) && !(dr === 0 && dc === 0);
}

function findAnyWordOnBoard(board, wordsArray) {
  const R = board.length;
  const C = board[0].length;
  const boardLetters = board.map(r => r.map(ch => (ch || "").toLowerCase()));
  const wordSet = new Set(wordsArray.map(w => w.toLowerCase()));
  const prefixSet = new Set();
  for (const w of wordsArray) {
    for (let i = 1; i <= w.length; i++) prefixSet.add(w.slice(0, i).toLowerCase());
  }
  const visited = Array.from({ length: R }, () => Array(C).fill(false));

  function dfs(r, c, acc) {
    const s = acc + (boardLetters[r][c] || "");
    if (!prefixSet.has(s)) return null;
    if (wordSet.has(s)) return s;
    visited[r][c] = true;
    const dr = [-1,-1,-1,0,0,1,1,1];
    const dc = [-1,0,1,-1,1,-1,0,1];
    for (let k = 0; k < 8; k++) {
      const nr = r + dr[k];
      const nc = c + dc[k];
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited[nr][nc]) {
        const found = dfs(nr, nc, s);
        if (found) { visited[r][c] = false; return found; }
      }
    }
    visited[r][c] = false;
    return null;
  }

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const found = dfs(r, c, "");
      if (found) return found;
    }
  }
  return null;
}

function applyGravityAndRefill(b) {
  let newBoard = deepCopyBoard(b);
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][c]) {
        newBoard[write][c] = newBoard[r][c];
        if (write !== r) newBoard[r][c] = null;
        write--;
      }
    }
    for (let r = write; r >= 0; r--) newBoard[r][c] = randLetter();
  }
  return newBoard;
}

// === Main component ===
export default function BookwormCConcepts() {
  const [board, setBoard] = useState(() => makeCBoard());
  const [selected, setSelected] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setCurrentWord(selected.map(p => board[p.r][p.c]).join(""));
  }, [selected, board]);

  useEffect(() => {
    setQuestions(generateRandomQuestions());
  }, []);

  function handleCellClick(r,c) {
    if (!board[r][c]) return;
    setSelected(prev => {
      const idx = prev.findIndex(p => p.r === r && p.c === c);
      if (idx !== -1) return prev.slice(0, idx+1);
      if (prev.length === 0) return [{r,c}];
      const last = prev[prev.length-1];
      if (!isAdjacent(last, {r,c})) return [{r,c}];
      return [...prev, {r,c}];
    });
    setMessage("");
  }

  function clearSelection() {
    setSelected([]);
    setMessage("");
  }

  function submitSelectionAsWord() {
    const word = selected.map(p => board[p.r][p.c]).join("").toLowerCase();
    if (word.length < 3) { setMessage("Words must be at least 3 letters."); return; }
    if (!C_DICTIONARY[word]) { setMessage(`"${word.toUpperCase()}" not a C concept.`); return; }
    if (foundWords.has(word)) { setMessage(`Already found "${word.toUpperCase()}".`); return; }

    setFoundWords(prev => new Set(prev).add(word));
    setScore(s => s + word.length * word.length);
    setMessage(`Found "${word.toUpperCase()}" (+${word.length * word.length})`);

    const b = deepCopyBoard(board);
    selected.forEach(p => b[p.r][p.c] = null);
    setBoard(applyGravityAndRefill(b));
    setSelected([]);
  }

  function scrambleBoard() {
    setBoard(makeCBoard());
    setSelected([]);
    setFoundWords(new Set());
    setScore(0);
    setMessage("Board scrambled with C programming concepts!");
    setQuestions(generateRandomQuestions());
  }

  function giveHint() {
    const found = findAnyWordOnBoard(board, WORDS);
    if (found) setMessage(`Hint: ${C_DICTIONARY[found.toLowerCase()]}`);
    else setMessage("No words found — try scramble.");
  }

  // === Styles (same as your version) ===
  const styles = {
    container: { fontFamily: "system-ui, Arial, sans-serif", padding: 20, display: "flex", justifyContent: "center" },
    panel: { width: "min(1100px, 96%)", display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 },
    boardWrap: { background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
    colsContainer: { display: "flex", gap: 6, alignItems: "end", overflowX: "auto", padding: 6 },
    column: { display: "flex", flexDirection: "column-reverse", gap: 6 },
    tile: { width: 36, height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", position: "relative", fontWeight: 700 },
    tileDefault: { background: "#f3f4f6", color: "#111" },
    tileSelected: { background: "#16a34a", color: "#fff", boxShadow: "0 6px 12px rgba(16,185,129,0.2)" },
    controls: { display: "flex", gap: 8, marginTop: 12 },
    btn: { padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 },
    statsPanel: { background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
    smallMuted: { fontSize: 13, color: "#6b7280" }
  };

  // === Render ===
  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        {/* Board */}
        <div style={styles.boardWrap}>
          <h2 style={{ margin: 0 }}>📚 Bookworm — C Concepts</h2>
          <p style={{ marginTop: 6, marginBottom: 12, color: "#374151" }}>
            Click adjacent letters to form C programming concepts. Submit removes tiles and gravity pulls letters down.
          </p>
          <div style={styles.colsContainer}>
            {Array.from({ length: COLS }).map((_, c) => (
              <div key={c} style={styles.column}>
                {Array.from({ length: ROWS }).map((_, r) => {
                  const ch = board[r][c];
                  const isSel = selected.some(p => p.r === r && p.c === c);
                  const idx = selected.findIndex(p => p.r === r && p.c === c);
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r,c)}
                      style={{...styles.tile, ...(isSel ? styles.tileSelected : styles.tileDefault)}}
                      disabled={!ch}
                    >
                      {ch}
                      {idx !== -1 && <span style={{ position: "absolute", bottom: 2, right: 4, fontSize: 11, opacity: 0.95 }}>{idx+1}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 16, fontFamily: "monospace" }}>Word: <strong>{currentWord || "—"}</strong></div>
              <div style={styles.controls}>
                <button onClick={submitSelectionAsWord} style={{ ...styles.btn, background: "#0ea5a0", color: "#fff" }} disabled={selected.length === 0}>Submit</button>
                <button onClick={clearSelection} style={{ ...styles.btn, background: "#e5e7eb" }}>Clear</button>
                <button onClick={giveHint} style={{ ...styles.btn, background: "#fde68a" }}>Hint</button>
                <button onClick={scrambleBoard} style={{ ...styles.btn, background: "#f87171", color: "#fff" }}>Scramble</button>
              </div>
            </div>
            <div style={styles.smallMuted}>{message}</div>
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.statsPanel}>
          <h3 style={{ marginTop: 0 }}>Stats</h3>
          <div>Score: <strong>{score}</strong></div>
          <div style={{ marginTop: 8 }}>Found words: {foundWords.size}</div>

          <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>Found list</div>
          <div style={{ maxHeight: 120, overflow: "auto" }}>
            {Array.from(foundWords).length === 0 ? (
              <div style={{ color: "#6b7280" }}>No words yet</div>
            ) : (
              <ul style={{ paddingLeft: 16, marginTop: 0 }}>
                {Array.from(foundWords).map(w => (
                  <li key={w} style={{ fontFamily: "monospace" }}>{w.toUpperCase()} (+{w.length * w.length})</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>Random Concept Questions</div>
          <div style={{ maxHeight: 160, overflow: "auto" }}>
            {questions.map(([word, hint]) => (
              <div key={word} style={{ fontFamily: "monospace", marginBottom: 4 }}>
                <strong>{word.toUpperCase()}</strong>: {hint}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
            Tip: Click letters in order. Clicking a non-adjacent tile starts a new selection.
          </div>
        </div>
      </div>
    </div>
  );
}
