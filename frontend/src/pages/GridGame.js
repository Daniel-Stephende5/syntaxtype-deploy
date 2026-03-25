import React, { useState, useRef } from "react";
import "./GridGame.css";
import { runCCode } from "./judge0";
import { useScoreSubmission } from "../hooks/useScoreSubmission";

const GRID_ROWS = 10;
const GRID_COLS = 10;

function getRandomPos() {
  const r = Math.floor(Math.random() * GRID_ROWS);
  const c = Math.floor(Math.random() * GRID_COLS);
  return { row: r, col: c };
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export default function GridGameSimulator() {
  // =======================
  // Difficulty Levels
  // =======================
  const [difficulty, setDifficulty] = useState("Normal");
  
  // Score tracking
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const { submitScore, isSubmitting, submitMessage, submitSuccess } = useScoreSubmission();

  const getObstacleCount = () => {
    switch (difficulty) {
      case "Easy":
        return 0;
      case "Normal":
        return 10;
      case "Hard":
        return 20;
      default:
        return 10;
    }
  };

  // =======================
  // Initial Setup
  // =======================
  const [playerPos, setPlayerPos] = useState(getRandomPos);
  const [pokemonPos, setPokemonPos] = useState(() => {
    let pos, distance;
    do {
      pos = getRandomPos();
      distance = Math.abs(pos.row - playerPos.row) + Math.abs(pos.col - playerPos.col);
    } while (distance < 5);
    return pos;
  });

  const generateObstacles = () => {
    const obstacles = [];
    const OBSTACLE_COUNT = getObstacleCount();
    while (obstacles.length < OBSTACLE_COUNT) {
      const pos = getRandomPos();
      const occupied =
        (pos.row === playerPos.row && pos.col === playerPos.col) ||
        (pos.row === pokemonPos.row && pos.col === pokemonPos.col) ||
        obstacles.some((o) => o.row === pos.row && o.col === pos.col);
      if (!occupied) obstacles.push(pos);
    }
    return obstacles;
  };

  const [obstacles, setObstacles] = useState(generateObstacles);
  const [message, setMessage] = useState("🎮 Reach the Pokémon using rook-like moves!");
  const [showWhileEditor, setShowWhileEditor] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // =======================
  // ❤️ HEALTH SYSTEM
  // =======================
  const [health, setHealth] = useState(3);
  const [lastSafePosition, setLastSafePosition] = useState(playerPos);

  const renderHearts = () => {
    let hearts = "";
    for (let i = 0; i < health; i++) hearts += "❤️";
    return hearts;
  };

  // =======================
  // Code Templates
  // =======================
  const getForLoopCode = (startRow, startCol) => `#include <stdio.h>
int main() {
    int r = ${startRow};
    int c = ${startCol};

    for (int i = 0; i < 5; i++) {
        MOVE(r, c);
        // increment r or c here
    }
    return 0;
}`;

  const getWhileLoopCode = (startRow, startCol) => `#include <stdio.h>
int main() {
    int r = ${startRow};
    int c = ${startCol};

    int i = 0;
    while (i < 5) {
        MOVE(r, c);
        // increment r or c here
        i++;
    }
    return 0;
}`;

  const [codeInput, setCodeInput] = useState(getForLoopCode(playerPos.row, playerPos.col));
  const [whileCode, setWhileCode] = useState(getWhileLoopCode(playerPos.row, playerPos.col));

  // =======================
  // Game Logic
  // =======================
  async function runCode(customCode) {
    setMessage("⏳ Running your C code...");

    const instrumentedCode = `#include <stdio.h>
#define MOVE(r, c) printf("ROW=%d COL=%d\\n", (r), (c));
${customCode}`;

    const result = await runCCode(instrumentedCode);
    if (result.error) {
      setMessage("⚠️ Error contacting Judge0");
      return;
    }
    if (result.compile_output) {
      setMessage("❌ Compilation Error:\n" + result.compile_output);
      return;
    }
    if (result.stderr) {
      setMessage("❌ Runtime Error:\n" + result.stderr);
      return;
    }

    const moves = (result.stdout || "")
      .trim()
      .split("\n")
      .map((line) => {
        const match = line.match(/ROW=(\d+)\s+COL=(\d+)/);
        if (match) return { row: parseInt(match[1]), col: parseInt(match[2]) };
        return null;
      })
      .filter(Boolean);

    if (moves.length === 0) {
      setMessage("⚠️ No moves detected. Use MOVE(r, c) for each step!");
      return;
    }

    let currentPos = playerPos;

    for (let pos of moves) {
      // Must be straight (rook move)
      if (!(pos.row === currentPos.row || pos.col === currentPos.col)) {
        setMessage("❌ Invalid move! Move must be horizontal or vertical only.");
        return;
      }

      // Determine movement direction
      const rowStep = pos.row === currentPos.row ? 0 : pos.row > currentPos.row ? 1 : -1;
      const colStep = pos.col === currentPos.col ? 0 : pos.col > currentPos.col ? 1 : -1;

      // Scan path cell by cell
      while (currentPos.row !== pos.row || currentPos.col !== pos.col) {
        const nextRow = currentPos.row + rowStep;
        const nextCol = currentPos.col + colStep;

        // Out of bounds
        if (nextRow < 0 || nextRow >= GRID_ROWS || nextCol < 0 || nextCol >= GRID_COLS) {
          setMessage("❌ Out of bounds!");
          return;
        }

        // Hit obstacle
        if (obstacles.some(o => o.row === nextRow && o.col === nextCol)) {
          setHealth(h => h - 1);

          if (health - 1 > 0) {
            setMessage("💥 Hit obstacle! Lost 1 ❤️. Returning to last safe position.");
            setPlayerPos(lastSafePosition);
          } else {
            setMessage("💀 GAME OVER! No hearts left.");
            setGameOver(true);
            // Calculate score based on difficulty and remaining health
            const difficultyBonus = difficulty === "Hard" ? 30 : difficulty === "Normal" ? 20 : 10;
            const finalScore = difficultyBonus + (health * 10);
            setScore(finalScore);
            setShowSubmitButton(true);
          }
          return;
        }

        // Move to next cell
        currentPos = { row: nextRow, col: nextCol };
        setPlayerPos(currentPos);
        await sleep(150);

        // Check if reached Pokémon
        if (currentPos.row === pokemonPos.row && currentPos.col === pokemonPos.col) {
          setMessage("🎉 You found the Pokémon! 🎊");
          // Calculate score based on difficulty
          const difficultyBonus = difficulty === "Hard" ? 50 : difficulty === "Normal" ? 30 : 20;
          const finalScore = 100 + difficultyBonus;
          setScore(finalScore);
          setShowSubmitButton(true);
          return;
        }
      }

      // Update last safe position after completing this move
      setLastSafePosition(currentPos);
    }

    setMessage("⏳ Keep moving! Adjust your loops to reach the Pokémon.");
  }

  // =======================
  // New Game
  // =======================
  function newGame() {
    let newPlayer, newPokemon, distance;
    do {
      newPlayer = getRandomPos();
      newPokemon = getRandomPos();
      distance = Math.abs(newPokemon.row - newPlayer.row) + Math.abs(newPokemon.col - newPlayer.col);
    } while (distance < 5);

    setPlayerPos(newPlayer);
    setLastSafePosition(newPlayer);
    setPokemonPos(newPokemon);
    setObstacles(generateObstacles());
    setHealth(3);
    setScore(0);
    setGameOver(false);
    setShowSubmitButton(false);
    setSubmitMessage("");

    setCodeInput(getForLoopCode(newPlayer.row, newPlayer.col));
    setWhileCode(getWhileLoopCode(newPlayer.row, newPlayer.col));
    setMessage(`🎲 New ${difficulty} game! Avoid obstacles and reach Pokémon!`);
  }

  // =======================
  // UI Rendering
  // =======================
  const difficultyButtonStyle = (level) => ({
    padding: "10px 20px",
    margin: "0 8px",
    borderRadius: "8px",
    border: "2px solid #333",
    backgroundColor:
      difficulty === level
        ? level === "Easy"
          ? "#81C784"
          : level === "Normal"
          ? "#FFD54F"
          : "#E57373"
        : "#f0f0f0",
    color: difficulty === level ? "#000" : "#555",
    fontWeight: difficulty === level ? "bold" : "normal",
    boxShadow: difficulty === level ? "0 0 10px rgba(0,0,0,0.4)" : "none",
    cursor: "pointer",
    transition: "0.2s ease",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <h2>Pokémon Hunting Grid ({difficulty} Mode)</h2>

      {/* ❤️ HEALTH DISPLAY */}
      <div style={{ fontSize: "28px", marginBottom: "10px" }}>{renderHearts()}</div>

      {/* Difficulty Buttons */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
          {["Easy", "Normal", "Hard"].map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
                setMessage(`🎮 Difficulty set to ${level}. Press New Game.`);
                setObstacles([]);
              }}
              style={difficultyButtonStyle(level)}
            >
              {level}
            </button>
          ))}
        </div>
        
        {/* Instructions Toggle Button */}
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          style={{
            padding: "10px 20px",
            backgroundColor: showInstructions ? "#4caf50" : "#66bb6a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {showInstructions ? "Hide Instructions" : "Show Instructions"}
        </button>
      </div>

      {/* Main Game Area with Grid and Instructions */}
      <div style={{ 
        display: "flex", 
        gap: "50px", 
        alignItems: "flex-start", 
        marginBottom: "20px",
        justifyContent: "center",
        width: "100%",
        maxWidth: "1200px"
      }}>
        {/* Grid */}
        <div className="grid">
          {Array.from({ length: GRID_ROWS }).map((_, r) => (
            <div key={r} className="row">
              {Array.from({ length: GRID_COLS }).map((_, c) => {
                let cellContent = "";
                if (r === playerPos.row && c === playerPos.col) cellContent = "🧍";
                else if (r === pokemonPos.row && c === pokemonPos.col)
                  cellContent = <img src="/images/pokeball.png" alt="Pokemon" style={{ width: "28px", height: "28px" }} />;
                else if (obstacles.some(o => o.row === r && o.col === c))
                  cellContent = "🪨";

                return (
                  <div key={c} className="cell">{cellContent}</div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Instructions Panel */}
        {showInstructions && (
          <div style={{
            backgroundColor: "#e8f5e9",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #81c784",
            width: "320px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ color: "#2e7d32", marginTop: 0, marginBottom: "15px" }}>📖 How to Play</h3>
            
            <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}>
              <p><strong>🎯 Objective:</strong> Move the player (🧍) to catch the Pokémon (🔴)!</p>
              
              <p><strong>🎮 Controls:</strong></p>
              <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                <li>Write C code using for/while loops</li>
                <li>Use <code style={{ backgroundColor: "#fff", padding: "2px 6px", borderRadius: "3px" }}>MOVE(r, c)</code> to move</li>
                <li>Increment/decrement <code style={{ backgroundColor: "#fff", padding: "2px 6px", borderRadius: "3px" }}>r</code> or <code style={{ backgroundColor: "#fff", padding: "2px 6px", borderRadius: "3px" }}>c</code></li>
              </ul>

              <p><strong>📏 Movement Rules:</strong></p>
              <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                <li>Only horizontal or vertical moves</li>
                <li>Cannot move diagonally</li>
                <li>Avoid obstacles (🪨)</li>
              </ul>

              <p><strong>❤️ Health System:</strong></p>
              <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                <li>Start with 3 hearts</li>
                <li>Lose 1 heart per obstacle hit</li>
                <li>Return to last safe position</li>
                <li>Game over at 0 hearts</li>
              </ul>

              <p><strong>🎚️ Difficulty:</strong></p>
              <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                <li><strong>Easy:</strong> No obstacles</li>
                <li><strong>Normal:</strong> 10 obstacles</li>
                <li><strong>Hard:</strong> 20 obstacles</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Score Display */}
      {(score > 0 || showSubmitButton) && (
        <div style={{ marginBottom: "15px", fontSize: "18px", fontWeight: "bold" }}>
          <span style={{ color: "#4caf50" }}>Score: {score}</span>
          
          {showSubmitButton && (
            <div style={{ marginTop: "10px" }}>
              {isSubmitting ? (
                <span>Submitting score...</span>
              ) : submitMessage ? (
                <span style={{ color: submitSuccess ? "#4caf50" : "#f44336" }}>{submitMessage}</span>
              ) : (
                <button 
                  onClick={() => {
                    submitScore('GRID', { wpm: 0, accuracy: 100, score });
                    setShowSubmitButton(false);
                  }}
                  style={{
                    padding: "8px 20px",
                    fontSize: "14px",
                    cursor: "pointer",
                    borderRadius: "5px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    marginLeft: "15px"
                  }}
                >
                  Submit to Leaderboard
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <button style={{ marginBottom: "10px" }} onClick={() => setShowWhileEditor(!showWhileEditor)}>
        {showWhileEditor ? "Hide While Loop Editor" : "Show While Loop Editor"}
      </button>

      <textarea
        rows={12}
        cols={60}
        style={{ marginBottom: "10px", width: "550px", maxWidth: "100%" }}
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
      />
      {showWhileEditor && (
        <textarea
          rows={12}
          cols={60}
          style={{ marginBottom: "10px", width: "550px", maxWidth: "100%" }}
          value={whileCode}
          onChange={(e) => setWhileCode(e.target.value)}
        />
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => runCode(codeInput)}>Run For Loop Code</button>
        <button onClick={() => runCode(whileCode)}>Run While Loop Code</button>
        <button onClick={newGame}>New Game</button>
      </div>

      <pre style={{ marginTop: 12, textAlign: "center" }}>{message}</pre>
    </div>
  );
}
