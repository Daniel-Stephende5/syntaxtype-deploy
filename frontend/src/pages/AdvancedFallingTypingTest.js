import React, { useState, useEffect, useRef } from "react";
import '../css/FallingTypingTest.css';
import AdvancedFallingLocalSetup from "./AdvancedFallingLocalSetup";
import { API_BASE } from "../utils/api";

const GAME_AREA_HEIGHT = 650;

const AdvancedFallingTypingTest = () => {
  const [gameDuration, setGameDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [availableWords, setAvailableWords] = useState([]);
  const [wrongWordsPool, setWrongWordsPool] = useState([]);
  const [fallingWords, setFallingWords] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [activeWordId, setActiveWordId] = useState(null);
  const [score, setScore] = useState(0);
  const latestScoreRef = useRef(score);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lives, setLives] = useState(null);
  const [useLives, setUseLives] = useState(false);
  const [speed, setSpeed] = useState(1);

  const wordIdCounter = useRef(0);
  const fallingWordsRef = useRef([]);



useEffect(() => {
  const raw = JSON.parse(sessionStorage.getItem("fallingGameConfig"));
const config = raw?.config || raw;
 

  if (!config) return;

  setAvailableWords(config.words || []);
  setWrongWordsPool(config.wrongWords || []);
  setGameDuration(config.duration || 60);
  setTimeLeft(config.duration || 60);
  setSpeed(config.speed || 1);

  if (config.useLives) {
    setUseLives(true);
    setLives(config.maxLives);
  } else {
    setUseLives(false);
    setLives(null);
  }
}, []);

  useEffect(() => {
    latestScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (isGameOver) {
      // TODO: Deprecated - uses old endpoint without leaderboard update
      // This gamemode will be removed due to time constraints
      fetch(`${API_BASE}/api/scores/falling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score,
          timeInSeconds: gameDuration,
          challengeType: "advanced_falling_typing_test",
        }),
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save score");
        console.log("✅ Advanced falling score submitted!");
      })
      .catch(err => console.error("❌ Error submitting score:", err));
    }
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

 useEffect(() => {
  if ((availableWords.length === 0 && wrongWordsPool.length === 0) || isGameOver) return;

  let timeoutId;

  const spawnWordsRandomly = () => {
    if (isGameOver) return;

    // 1. Get a list of words currently on the screen to avoid duplicates
    const currentlyFallingTexts = fallingWordsRef.current.map(w => w.text);

    // 2. Filter pools to only include words NOT currently on screen
    const uniqueAvailable = availableWords.filter(w => !currentlyFallingTexts.includes(w));
    const uniqueWrong = wrongWordsPool.filter(w => !currentlyFallingTexts.includes(w));

    // Stop if we have no words left to spawn
    if (uniqueAvailable.length === 0 && uniqueWrong.length === 0) return;

    const batchSize = Math.floor(Math.random() * 6) + 5;
    const newWords = [];

    for (let i = 0; i < batchSize; i++) {
      // Determine if we should use a wrong word
      const shouldPickWrong = Math.random() < 0.25 && uniqueWrong.length > 0;
      
      // Select the pool and pick a random word
      const pool = shouldPickWrong ? uniqueWrong : uniqueAvailable;
      
      // Fallback in case a pool is empty
      if (pool.length === 0) continue; 

      const randomIndex = Math.floor(Math.random() * pool.length);
      const wordText = pool[randomIndex];

      // Remove the chosen word from the local pool so it's not picked twice in the same batch
      pool.splice(randomIndex, 1);

      newWords.push({
        id: wordIdCounter.current++,
        text: wordText,
        y: 0,
        x: (i * 12) + Math.random() * 10,
        isWrong: shouldPickWrong,
      });
    }

    setFallingWords(prev => {
      const updated = [...prev, ...newWords];
      // Keep the ref in sync for the animation loop
      fallingWordsRef.current = updated;
      return updated;
    });

    const nextInterval = (Math.random() * 9000 + 15000) / speed;
    timeoutId = setTimeout(spawnWordsRandomly, nextInterval);
  };

  spawnWordsRandomly(); // initial spawn

  return () => clearTimeout(timeoutId); // cleanup on unmount or game over
}, [availableWords, wrongWordsPool, isGameOver, speed, useLives]);
 useEffect(() => {
  if (isGameOver) return;

  let animationFrameId;

  const update = () => {
      if (isGameOver) return;
    let lostWords = 0;

    const updated = fallingWordsRef.current.reduce((acc, word) => {
      const newY = word.y + (0.09 * speed);

      if (newY > GAME_AREA_HEIGHT) {
       if (!word.isWrong) console.log("Life lost to correct word:", word.text);
  if (word.isWrong) console.log("Wrong word ignored:", word.text);
        if (useLives && word.isWrong === false) lostWords += 1;
        return acc;
      }

      acc.push({ ...word, y: newY });
      return acc;
    }, []);

    fallingWordsRef.current = updated;
    setFallingWords(updated);

    if (lostWords > 0 && useLives) {
      setLives(prev => {
        const updatedLives = prev - lostWords;
        if (updatedLives <= 0) {
          setIsGameOver(true);
          return 0;
        }
        return updatedLives;
      });
    }

    animationFrameId = requestAnimationFrame(update);
  };

  animationFrameId = requestAnimationFrame(update);

  return () => cancelAnimationFrame(animationFrameId);
}, [isGameOver, speed, useLives]);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentInput(value);

    if (value === "") {
      setActiveWordId(null);
      return;
    }

    const match = fallingWordsRef.current.find(word => word.text.startsWith(value));

    if (match) {
      setActiveWordId(match.id);
      if (value === match.text) {

  if (match.isWrong) {
    // ❌ Wrong word typed → LOSE LIFE
    if (useLives) {
      setLives(prev => {
        const updated = prev - 1;
        if (updated <= 0) {
          setIsGameOver(true);
          return 0;
        }
        return updated;
      });
    }
  } else {
    // ✅ Correct word typed → SCORE
    setScore(prev => prev + 1);
  }

  // ✅ Remove the word (applies to both)
  setFallingWords(prev => {
    const updated = prev.filter(word => word.id !== match.id);
    fallingWordsRef.current = updated;
    return updated;
  });

  setCurrentInput("");
  setActiveWordId(null);
}
    } else {
      setActiveWordId(null);
    }
  };

  const handleRestart = () => {
  const config = JSON.parse(sessionStorage.getItem("fallingGameConfig"));

  setFallingWords([]);
  fallingWordsRef.current = [];
  setCurrentInput("");
  setActiveWordId(null);
  setScore(0);
  setIsGameOver(false);
  wordIdCounter.current = 0;

  if (config) {
    setAvailableWords(config.words || []);
    setWrongWordsPool(config.wrongWords || []);
    setGameDuration(config.duration || 60);
    setTimeLeft(config.duration || 60);
    setSpeed(config.speed || 1);

    if (config.useLives) {
      setUseLives(true);
      setLives(config.maxLives);
    } else {
      setUseLives(false);
      setLives(null);
    }
  }
};

  const renderWord = (word) => {
    if (word.id !== activeWordId) return word.text;
    return [...word.text].map((char, i) => (
      <span key={i} style={{ color: currentInput[i] === char ? "lime" : "yellow" }}>
        {char}
      </span>
    ));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Advanced Falling Typing Test</h2>
      <p style = {{ fontWeight: "bold" }}>
        Score: {score} | Time Left: {timeLeft}s {useLives && `| Lives: ${lives}`}
        
      </p>
      <p style = {{ color: "green",fontWeight: "bold"}}> Type the correct C terminologies, Wrong word and out of bounds correct word reduces life.
        </p>
      <div
        className="game-area"
        style={{
          backgroundImage: "url('/images/background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: 'relative',
          height: `${GAME_AREA_HEIGHT}px`,
          overflow: 'hidden',
          border: '2px solid #ccc'
        }}
      >
        {fallingWords.map(word => (
          <div
            key={word.id}
            className="falling-word"
            style={{
              position: 'absolute',
              top: `${word.y}px`,
              left: `${word.x}%`,
              fontSize: '18px',
              color: word.isWrong ? '#FFA500' : '#FFA500'
            }}
          >
            {renderWord(word)}
          </div>
        ))}

        {isGameOver && (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.7)',
              padding: '20px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '24px',
              textAlign: 'center'
            }}
          >
            <p>Game Over!</p>
            <p>Final Score: {score}</p>
            <button onClick={handleRestart} style={{ padding: '10px 20px', fontSize: '16px' }}>
              Restart
            </button>
          </div>
        )}
      </div>

      {!isGameOver && (
        <input
          type="text"
          placeholder="Start typing..."
          value={currentInput}
          onChange={handleInputChange}
          style={{ width: "100%", marginTop: "1rem", padding: "10px", fontSize: "16px" }}
          autoFocus
        />
      )}
    </div>
  );
};

export default AdvancedFallingTypingTest;
