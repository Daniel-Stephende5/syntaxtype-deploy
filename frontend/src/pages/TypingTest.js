import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/typingtest.css";
import { API_BASE } from "../utils/api";
import { useScoreSubmission } from '../hooks/useScoreSubmission';
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import codeChallenges from "./codeChallenges";
import AdvancedFallingLocalSetup from "./AdvancedFallingLocalSetup";

const TypingTest = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [sampleParagraph, setSampleParagraph] = useState("");
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blankIndices, setBlankIndices] = useState([]);
  const [challengeType, setChallengeType] = useState("normal");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [score, setScore] = useState(0);
  const [blankInputs, setBlankInputs] = useState([]);
  const [showCursor, setShowCursor] = useState(true);

  // Leaderboard submission state
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const { submitScore, isSubmitting, submitMessage, submitSuccess, snackbarOpen, setSnackbarOpen } = useScoreSubmission();

  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // ✅ Fetch challenge list
  const fetchChallengeList = async (type) => {
    setError(null);
    try {
      if (type === "normal") {
        setChallenges(codeChallenges);
      } else if (type === "falling") {
        const res = await fetch(`${API_BASE}/api/challenges/falling`);
        if (!res.ok) throw new Error("Failed to fetch falling challenges");
        const data = await res.json();
        setChallenges(data);
      } else if (type === "advancedFalling") {
       setChallenges(AdvancedFallingLocalSetup);
      } else {
        throw new Error("Unknown challenge type");
      }
    } catch (err) {
      setError(err.message || "Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load selected challenge
  const loadSelectedChallenge = async (challenge) => {
    try {
      if (challengeType === "normal") {
        setSelectedChallenge(challenge);
        setBlankInputs(new Array(challenge.answers.length).fill(""));
        setInput("");
        setIsTestComplete(false);
      } else if (challengeType === "falling") {
        const res = await fetch(
          `${API_BASE}/api/challenges/falling/${challenge.challengeId || challenge.id}`
        );
        if (!res.ok) throw new Error("Failed to load falling challenge");
        const data = await res.json();
        sessionStorage.setItem("fallingChallenge", JSON.stringify(data));
        navigate("/fallingtypingtest");
        return;
      } else if (challengeType === "advancedFalling") {
         sessionStorage.setItem(
    "fallingGameConfig",
    JSON.stringify(challenge.config)
  );

  navigate("/fallingtypingtest2");
  return;
      } else {
        throw new Error("Unknown challenge type");
      }

      setInput("");
      setCorrectCount(0);
      setIsTestComplete(false);
      setStartTime(null);
      setElapsedTime(0);
      setWpm(0);
      setScore(0);
    } catch (err) {
      setError(err.message || "Failed to load challenge details.");
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (startTime && !isTestComplete) {
      timer = setInterval(() => {
        const now = Date.now();
        const seconds = Math.floor((now - startTime) / 1000);
        setElapsedTime(seconds);
        const wordsTyped = input.length / 5;
        const liveWpm = seconds > 0 ? Math.round((wordsTyped / seconds) * 60) : 0;
        setWpm(liveWpm);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isTestComplete, input]);

  useEffect(() => {
    if (!selectedChallenge || isTestComplete) return;
    const handleKeyDown = (e) => {
      if (e.key.length === 1) {
        if (!startTime) setStartTime(Date.now());
        setInput((prev) => prev + e.key);
      }
      if (e.key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      }
      if (e.key === "Enter") {
        setInput((prev) => prev + "\n");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChallenge, isTestComplete, startTime]);

  useEffect(() => {
    if (!selectedChallenge || isTestComplete) return;
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [selectedChallenge, isTestComplete]);

  useEffect(() => {
    setLoading(true);
    fetchChallengeList(challengeType);
    setSelectedChallenge(null);
    setSampleParagraph("");
    setInput("");
    setCorrectCount(0);
    setIsTestComplete(false);
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setScore(0);
  }, [challengeType]);

  // Complete test
  const completeTest = () => {
    if (!selectedChallenge || !startTime) return;
    const endTime = Date.now();
    const finalElapsed = Math.floor((endTime - startTime) / 1000);
    const { code, answers } = selectedChallenge;
    let fullExpected = code;
    answers.forEach((answer) => {
      fullExpected = fullExpected.replace("___", answer);
    });
    const trimmedInput = input.slice(0, fullExpected.length);
    let correctChars = 0;
    for (let i = 0; i < fullExpected.length; i++) {
      if (trimmedInput[i] === fullExpected[i]) {
        correctChars++;
      }
    }
    const totalChars = fullExpected.length;
    const accuracyPercent = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    const wordCount = trimmedInput.trim().split(/\s+/).filter(Boolean).length;
    const finalWpm = finalElapsed > 0 ? Math.round((wordCount / finalElapsed) * 60) : 0;
    let timeMultiplier = 1;
    if (finalElapsed <= 60) timeMultiplier = 1;
    else if (finalElapsed <= 90) timeMultiplier = 0.95;
    else if (finalElapsed <= 120) timeMultiplier = 0.9;
    else timeMultiplier = 0.8;
    const finalScore = Math.min(100, Math.round(accuracyPercent * timeMultiplier));
    setCorrectCount(correctChars);
    setElapsedTime(finalElapsed);
    setWpm(finalWpm);
    setIsTestComplete(true);
    setScore(finalScore);
    fetch(`${API_BASE}/api/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: finalScore,
        timeInSeconds: finalElapsed,
        challengeType: "normal",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save score");
        console.log("✅ Score submitted successfully!");
      })
      .catch((err) => {
        console.error("❌ Error submitting score:", err);
      });
    setShowSubmitButton(true);
  };

  // Submit score to leaderboard
  const handleSubmitScore = async () => {
    const { code, answers } = selectedChallenge;
    const parts = code.split('___');
    let fullExpected = parts[0];
    answers.forEach((answer, i) => {
      fullExpected += answer + (parts[i + 1] || '');
    });
    const trimmedInput = input.slice(0, fullExpected.length);
    let correctChars = 0;
    for (let i = 0; i < fullExpected.length; i++) {
      if (trimmedInput[i] === fullExpected[i]) {
        correctChars++;
      }
    }
    const totalChars = fullExpected.length;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    const payload = { wpm: wpm, accuracy: accuracy, score: score };
    const success = await submitScore('TYPING_TESTS', payload);
    if (success) {
      setShowSubmitButton(false);
    }
  };

  const parseCodeSegments = () => {
    if (!selectedChallenge) return [];
    const { code, answers } = selectedChallenge;
    const parts = code.split("___");
    const segments = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) segments.push({ type: "text", content: parts[i] });
      if (i < parts.length - 1) {
        segments.push({
          type: "blank",
          index: i,
          expected: answers[i] || "",
          value: blankInputs[i] || ""
        });
      }
    }
    return segments;
  };

  // ── Colored text rendering ──────────────────────────────────────────────────
  const renderColoredText = () => {
    if (!selectedChallenge) return null;
    const { code, answers } = selectedChallenge;
    const parts = code.split("___");
    let inputIndex = 0;

    return (
      <div className="tt-code-area" onClick={() => { if (!startTime) setStartTime(Date.now()); }}>
        {parts.map((part, i) => {
          const elements = [];

          // Normal text characters
          part.split("").forEach((char, j) => {
            const isCursorHere = inputIndex === input.length && !isTestComplete;
            const typedChar = input[inputIndex];
            let charClass = "tt-char";
            if (typedChar) charClass += typedChar === char ? " tt-char-correct" : " tt-char-wrong";

            elements.push(
              <span key={`char-${i}-${j}`} className={charClass} style={{ position: "relative" }}>
                {isCursorHere && (
                  <span className="tt-cursor" style={{ opacity: showCursor ? 1 : 0 }} />
                )}
                {char}
              </span>
            );
            inputIndex++;
          });

          // Blank word
          if (i < parts.length - 1) {
            const expected = answers[i] || "";
            const userTyped = input.slice(inputIndex, inputIndex + expected.length);
            const blankFilled = userTyped.length === expected.length;
            const blankCorrect = blankFilled && userTyped === expected;

            expected.split("").forEach((char, j) => {
              const isCursorHere = inputIndex === input.length && !isTestComplete;
              const typedChar = userTyped[j];
              let charClass = "tt-char tt-blank-char";
              if (typedChar) charClass += typedChar === char ? " tt-char-correct" : " tt-char-wrong";
              if (blankCorrect) charClass += " tt-blank-done";

              elements.push(
                <span key={`blank-${i}-${j}`} className={charClass} style={{ position: "relative" }}>
                  {isCursorHere && (
                    <span className="tt-cursor" style={{ opacity: showCursor ? 1 : 0 }} />
                  )}
                  {typedChar || "_"}
                </span>
              );
              inputIndex++;
            });
          }

          return elements;
        })}

        {/* Cursor at very end */}
        {inputIndex === input.length && !isTestComplete && (
          <span className="tt-cursor tt-cursor-end" style={{ opacity: showCursor ? 1 : 0 }} />
        )}
      </div>
    );
  };

  const handleChallengeTypeChange = (type) => {
    setChallengeType(type);
  };

  if (loading) return (
    <div className="tt-loading">
      <div className="tt-loading-inner">
        <div className="tt-loading-spinner" />
        <p>Loading challenges…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="tt-error">
      <span className="tt-error-icon">⚠️</span>
      <p>{error}</p>
    </div>
  );

  const DIFF_COLOR = { easy: "#2d7a3a", medium: "#b45309", hard: "#b91c1c" };
  const DIFF_LABEL = { easy: "🟢 EASY", medium: "🟡 MEDIUM", hard: "🔴 HARD" };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={submitSuccess ? "success" : "error"}
          sx={{ width: "100%", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
        >
          {submitMessage}
        </Alert>
      </Snackbar>

    <h1
  className="tt-navbar-title"
  style={{
    padding: "24px 24px 0",
    fontFamily: "'Press Start 2P', monospace",
    fontSize: "11px",
    color: "var(--ink)",
    textAlign: "center",
    width: "100%"
  }}
>
  ⌨️ Typing Test
</h1>

      {/* ── Page body ── */}
      <div className="tt-page">

        {/* ── Mode tabs ── */}
        <div className="tt-tabs">
          {[
            { id: "normal",          label: "📝 Paragraph" },
            
            { id: "advancedFalling", label: "⚡ Advanced" },
          ].map(({ id, label }) => (
            <button
              key={id}
              className={`tt-tab${challengeType === id ? " tt-tab-active" : ""}`}
              onClick={() => handleChallengeTypeChange(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Challenge list ── */}
        {!selectedChallenge && (
          <div className="tt-card">
            <h3 className="tt-card-title">Select a Challenge</h3>

            {["easy", "medium", "hard"].map((level) => {
              const filtered = challenges.filter((c) => c.difficulty === level);
              if (filtered.length === 0) return null;

              return (
                <div key={level} className="tt-diff-section">
                  <div
                    className="tt-diff-header"
                    style={{ color: DIFF_COLOR[level], borderBottomColor: DIFF_COLOR[level] }}
                  >
                    {DIFF_LABEL[level]}
                  </div>

                  <ul className="tt-challenge-list">
                    {filtered.map((challenge) => (
                      <li key={challenge.id} className="tt-challenge-item">
                        <span
                          className="tt-challenge-badge"
                          style={{ background: DIFF_COLOR[level] }}
                        >
                          {challenge.id}
                        </span>
                        <button
                          className="tt-challenge-btn"
                          onClick={() => loadSelectedChallenge(challenge)}
                        >
                          {challenge.question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Active challenge ── */}
        {selectedChallenge && (
          <div className="tt-challenge-wrap">

            {/* Question banner */}
            <div className="tt-question-banner">
              <span className="tt-question-label">Challenge</span>
              <span className="tt-question-text">{selectedChallenge.question}</span>
            </div>

            {/* Stats bar */}
            <div className="tt-stats-bar">
              <div className="tt-stat">
                <div className="tt-stat-label">⏱ Time</div>
                <div className="tt-stat-value tt-stat-green">
                  {String(elapsedTime).padStart(2, "0")}
                  <span className="tt-stat-unit">s</span>
                </div>
              </div>
              <div className="tt-stat-divider" />
              <div className="tt-stat">
                <div className="tt-stat-label">⚡ WPM</div>
                <div className="tt-stat-value tt-stat-blue">
                  {String(wpm).padStart(2, "0")}
                </div>
              </div>
              <div className="tt-stat-divider" />
              <div className="tt-stat">
                <div className="tt-stat-label">🎯 Score</div>
                <div className="tt-stat-value tt-stat-red">
                  {String(score).padStart(3, "0")}
                </div>
              </div>
            </div>

            {/* Code typing area */}
            <div className="typing-container">
              {renderColoredText()}
            </div>

            {/* Submit test button */}
            {!isTestComplete && (
              <div className="tt-action-row">
                <button className="tt-submit-btn" onClick={() => completeTest(input)}>
                  ✓ Submit Test
                </button>
                <button
                  className="tt-back-btn"
                  onClick={() => setSelectedChallenge(null)}
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Post-test actions */}
            {isTestComplete && (
              <div className="tt-complete-banner">
                <div className="tt-complete-stars">
                  {score >= 90 ? "⭐⭐⭐" : score >= 70 ? "⭐⭐" : "⭐"}
                </div>
                <div className="tt-complete-msg">
                  {score >= 90 ? "Outstanding!" : score >= 70 ? "Great work!" : "Keep practicing!"}
                </div>
                <div className="tt-complete-detail">
                  Score <strong>{score}</strong> · {wpm} WPM · {elapsedTime}s
                </div>
              </div>
            )}

            {isTestComplete && showSubmitButton && (
              <div className="tt-action-row">
                <Button
                  variant="contained"
                  onClick={handleSubmitScore}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{
                    background: "#e8622a",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    textTransform: "none",
                    borderRadius: "6px",
                    boxShadow: "0 3px 0 #c44e1e",
                    padding: "10px 18px",
                    "&:hover": { background: "#c44e1e", boxShadow: "0 3px 0 #a03c15" },
                    "&:active": { boxShadow: "none", transform: "translateY(2px)" },
                  }}
                >
                  {isSubmitting ? "Submitting…" : "Submit to Leaderboard"}
                </Button>

                {!isSubmitting && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowSubmitButton(false);
                      setInput("");
                      setIsTestComplete(false);
                      setStartTime(null);
                      setElapsedTime(0);
                      setWpm(0);
                      setScore(0);
                      setBlankInputs(new Array(selectedChallenge.answers.length).fill(""));
                    }}
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      textTransform: "none",
                      borderRadius: "6px",
                      borderColor: "#ddd5c5",
                      color: "#1a1a2e",
                      background: "#ede7d9",
                      "&:hover": { background: "#ddd5c5", borderColor: "#1a1a2e" },
                    }}
                  >
                    ↩ Retry
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TypingTest;
