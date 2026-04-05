import React, { useState, useEffect, useRef } from "react";
import '../css/FallingTypingTest.css';
import { API_BASE } from "../utils/api";
import AdvancedFallingLocalSetup from "./AdvancedFAllingLocalSetup.js"
const GAME_AREA_HEIGHT = 500;
const GAME_AREA_WIDTH = 100; // in percent
const LANES = 8; // number of horizontal lanes

const AdvancedFallingTypingTest = () => {
  const [gameDuration, setGameDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [availableWords, setAvailableWords] = useState([]);
  const [wrongWordsPool, setWrongWordsPool] = useState([]);
  const [fallingWords, setFallingWords] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [activeWordId, setActiveWordId] = useState(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lives, setLives] = useState(null);
  const [useLives, setUseLives] = useState(false);
  const [speed, setSpeed] = useState(1);

  const wordIdCounter = useRef(0);
  const fallingWordsRef = useRef([]);
  const lastFrameTime = useRef(performance.now());
  const spawnTimer = useRef(0);

  // Load configuration
  useEffect(() => {
    const config = JSON.parse(sessionStorage.getItem("fallingGameConfig"));
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

  // Score reference
  useEffect(() => {
    fallingWordsRef.current = fallingWords;
  }, [fallingWords]);

  // Game timer
  useEffect(() => {
    if (isGameOver) return;

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
  }, [isGameOver]);

  // Spawn words function
  const spawnWords = () => {
    const baseBatch = 3;
    const batchSize = Math.min(baseBatch + Math.floor(score / 10), 10); // scaling batch

    const laneWidth = GAME_AREA_WIDTH / LANES;
    const newWords = [];

    for (let i = 0; i < batchSize; i++) {
      const useWrong = Math.random() < 0.25 && wrongWordsPool.length > 0;
      const word = useWrong
        ? wrongWordsPool[Math.floor(Math.random() * wrongWordsPool.length)]
        : availableWords[Math.floor(Math.random() * availableWords.length)];

      const laneIndex = i % LANES;
      const x = laneIndex * laneWidth + Math.random() * (laneWidth - 5);

      newWords.push({
        id: wordIdCounter.current++,
        text: word,
        y: 0,
        x,
        isWrong: useWrong,
      });
    }

    setFallingWords(prev => {
      const updated = [...prev, ...newWords];
      const limited = updated.slice(-50); // cap total words to prevent overload
      fallingWordsRef.current = limited;
      return limited;
    });
  };

  // Main game loop
  useEffect(() => {
    if (isGameOver) return;

    const update = (time) => {
      const delta = (time - lastFrameTime.current) / 16; // approx 60fps scale
      lastFrameTime.current = time;

      spawnTimer.current += delta;

      // spawn every 2.5s / speed
      if (spawnTimer.current >= 2.5 / speed) {
        spawnWords();
        spawnTimer.current = 0;
      }

      let lostWords = 0;

      const updated = fallingWordsRef.current.reduce((acc, word) => {
        const newY = word.y + 1 * delta * speed * 2; // smooth movement

        if (newY > GAME_AREA_HEIGHT) {
          if (useLives && !word.isWrong) lostWords += 1;
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

      requestAnimationFrame(update);
    };

    lastFrameTime.current = performance.now();
    requestAnimationFrame(update);
  }, [isGameOver, speed, useLives]);

  // Input handling
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
        if (match.isWrong && useLives) {
          setLives(prev => Math.max(prev - 1, 0));
          if (lives - 1 <= 0) setIsGameOver(true);
        } else {
          setScore(prev => prev + 1);
        }

        const updated = fallingWordsRef.current.filter(w => w.id !== match.id);
        fallingWordsRef.current = updated;
        setFallingWords(updated);

        setCurrentInput("");
        setActiveWordId(null);
      }
    } else {
      setActiveWordId(null);
    }
  };

  // Restart
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

  // Render word with active highlight
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
      <p>
        Score: {score} | Time Left: {timeLeft}s {useLives && `| Lives: ${lives}`}
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
              color: word.isWrong ? 'yellow' : 'yellow'
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
