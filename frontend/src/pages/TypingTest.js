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
   setLoading(true);
  setError(null);
  try {
    if (type === "normal") {
      // Local challenges
      setChallenges(codeChallenges);
    } else if (type === "falling") {
      const res = await fetch(`${API_BASE}/api/challenges/falling`);
      if (!res.ok) throw new Error("Failed to fetch falling challenges");
      const data = await res.json();
      setChallenges(data);
    }  else if (type === "advancedFalling") {
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
     setBlankInputs(new Array(challenge.answers.length).fill("")); // one per blank
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
  // Save config directly
  sessionStorage.setItem(
    "fallingGameConfig",
    JSON.stringify(challenge.config)
  );

  navigate("/fallingtypingtest2");
  return;
} else {
      throw new Error("Unknown challenge type");
    }

    // Reset test state for normal typing
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

      // Standard typing formula: 5 chars = 1 word
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
    // Ignore special keys except Backspace
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
  }, 500); // blink speed

  return () => clearInterval(interval);
}, [selectedChallenge, isTestComplete]);
  // Fetch challenges on type change
  useEffect(() => {
   
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

  // ===== BUILD FULL EXPECTED STRING (INCLUDING BLANKS) =====
  let fullExpected = code;

  answers.forEach((answer) => {
    fullExpected = fullExpected.replace("___", answer);
  });

  // ===== IGNORE EXTRA TYPED CHARACTERS =====
  const trimmedInput = input.slice(0, fullExpected.length);

  // ===== COUNT GREEN CHARACTERS =====
  let correctChars = 0;

  for (let i = 0; i < fullExpected.length; i++) {
    if (trimmedInput[i] === fullExpected[i]) {
      correctChars++;
    }
  }

  const totalChars = fullExpected.length;

  // ===== ACCURACY =====
  const accuracyPercent =
    totalChars > 0
      ? Math.round((correctChars / totalChars) * 100)
      : 0;

  // ===== WPM (BASED ON TYPED CONTENT ONLY) =====
  const wordCount =
    trimmedInput.trim().split(/\s+/).filter(Boolean).length;

  const finalWpm =
    finalElapsed > 0
      ? Math.round((wordCount / finalElapsed) * 60)
      : 0;

  // ===== TIME MULTIPLIER =====
  let timeMultiplier = 1;

  if (finalElapsed <= 60) timeMultiplier = 1;
  else if (finalElapsed <= 90) timeMultiplier = 0.95;
  else if (finalElapsed <= 120) timeMultiplier = 0.9;
  else timeMultiplier = 0.8;

  // ===== FINAL SCORE =====
  const finalScore = Math.min(
    100,
    Math.round(accuracyPercent * timeMultiplier)
  );

  // ===== UPDATE STATE =====
  setCorrectCount(correctChars);
  setElapsedTime(finalElapsed);
  setWpm(finalWpm);
  setIsTestComplete(true);
  setScore(finalScore);

  // ===== BACKEND SUBMISSION =====
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
    
  // Show submit to leaderboard button after test completion
  setShowSubmitButton(true);
};

// Submit score to leaderboard
const handleSubmitScore = async () => {
  // Calculate accuracy from the test
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
  
  const payload = {
    wpm: wpm,
    accuracy: accuracy,
    score: score
  };
  
  const success = await submitScore('TYPING_TESTS', payload);
  if (success) {
    setShowSubmitButton(false);
  }
};

 /*const getParagraphChars = () => {
  if (!selectedChallenge) return [];

  const { code, answers } = selectedChallenge;

  // Split paragraph by blanks ___
  const parts = code.split("___");
  const chars = [];

  for (let i = 0; i < parts.length; i++) {
    // Add normal characters
    chars.push(...parts[i].split(""));

    // Add a blank placeholder (as object)
    if (i < parts.length - 1) {
      chars.push({ isBlank: true });
    }
  }

  return chars;
};*/
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


  // Colored text rendering (UNCHANGED)
const renderColoredText = () => {
  if (!selectedChallenge) return null;

  const { code, answers } = selectedChallenge;
  const parts = code.split("___");

  let inputIndex = 0; // Tracks index in main input
  let globalIndex = 0;
return (
  <div
    style={{
      fontFamily: "monospace",
      fontSize: "1.1rem",
      lineHeight: "1.8rem",
      backgroundColor: "#f9f9f9",
      padding: "1rem",
      borderRadius: "8px",
      whiteSpace: "pre-wrap",
      minHeight: "150px",
      cursor: "text",
      position: "relative",
    }}
    onClick={() => {
      if (!startTime) setStartTime(Date.now());
    }}
  >
    {parts.map((part, i) => {
      const elements = [];

      // 1️⃣ Normal text
      part.split("").forEach((char, j) => {
        const isCursorHere =
          inputIndex === input.length && !isTestComplete;

        const typedChar = input[inputIndex];
        let color = "black";
        if (typedChar) color = typedChar === char ? "green" : "red";

        elements.push(
          <span
            key={`char-${i}-${j}`}
            style={{ position: "relative", color }}
          >
            {/* Cursor BEFORE character */}
            {isCursorHere && (
              <span
                style={{
                  position: "absolute",
                  left: "-1px",
                  top: 0,
                  width: "2px",
                  height: "100%",
                  backgroundColor: "#000",
                  opacity: showCursor ? 1 : 0,
                }}
              />
            )}

            {char}
          </span>
        );

        inputIndex++;
      });

      // 2️⃣ Blank word
      if (i < parts.length - 1) {
        const expected = answers[i] || "";
        const userTyped = input.slice(
          inputIndex,
          inputIndex + expected.length
        );

        let bgColor = "#4cc9f0";
        if (userTyped.length === expected.length) {
          bgColor =
            userTyped === expected ? "#d4edda" : "#f8d7da";
        }

        expected.split("").forEach((char, j) => {
          const isCursorHere =
            inputIndex === input.length && !isTestComplete;

          const typedChar = userTyped[j];
          let color = "#000";
          if (typedChar) color = typedChar === char ? "green" : "red";

          elements.push(
            <span
              key={`blank-${i}-${j}`}
              style={{
                position: "relative",
                color,
                backgroundColor: bgColor,
              }}
            >
              {isCursorHere && (
                <span
                  style={{
                    position: "absolute",
                    left: "-1px",
                    top: 0,
                    width: "2px",
                    height: "100%",
                    backgroundColor: "#000",
                    opacity: showCursor ? 1 : 0,
                  }}
                />
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
      <span
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          backgroundColor: "#000",
          opacity: showCursor ? 1 : 0,
        }}
      />
    )}
  </div>
);
};



 
  const handleChallengeTypeChange = (type) => {
    setChallengeType(type);
  };
 
  if (loading) return <div style={{ padding: "2rem" }}>Loading challenges...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
 
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
          sx={{ width: "100%" }}
        >
          {submitMessage}
        </Alert>
      </Snackbar>
      
      <nav className="navbar">
        <button className="hamburger-icon" onClick={toggleMenu}>☰</button>
        <div className="navbar-left">
          <h1 className="navbar-title">Typing Test</h1>
        </div>
        <div className="navbar-right">
          <button className="nav-button" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </nav>
 
      <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
        <div className="tab-buttons" style={{ padding: "50px" }}>
          <button
            className={`tab-button ${challengeType === "normal" ? "active" : ""}`}
            onClick={() => handleChallengeTypeChange("normal")}
          >
            Paragraph Typing Test
          </button>
         
          <button
            className={`tab-button ${challengeType === "advancedFalling" ? "active" : ""}`}
            onClick={() => handleChallengeTypeChange("advancedFalling")}
          >
            Advanced Falling Typing Test
          </button>
        </div>

        {!selectedChallenge && (
  <div className="results-box">
    <h3 style={{ marginBottom: "20px" }}>
      Select a Challenge
    </h3>

    {["easy", "medium", "hard"].map((level) => {
      const filtered = challenges.filter(
        (c) => c.difficulty === level
      );

      if (filtered.length === 0) return null;

      const levelColor =
        level === "easy"
          ? "#28a745"
          : level === "medium"
          ? "#ffc107"
          : "#dc3545";

      return (
        <div key={level} style={{ marginBottom: "30px" }}>
          {/* Section Header */}
          <div
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "12px",
              color: levelColor,
              borderBottom: `2px solid ${levelColor}`,
              paddingBottom: "5px",
            }}
          >
            {level === "easy" && "🟢 EASY"}
            {level === "medium" && "🟡 MEDIUM"}
            {level === "hard" && "🔴 HARD"}
          </div>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {filtered.map((challenge) => (
              <li
                key={challenge.id}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    backgroundColor: levelColor,
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {challenge.id}
                </span>

                <button
                  onClick={() => loadSelectedChallenge(challenge)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    backgroundColor: "#554c16",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
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

        {selectedChallenge && (
          
          <>
          <div
  style={{
    background: "#1e1e1e",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: "8px",
    marginTop: "20px",
    marginBottom: "15px",
    fontSize: "16px",
    fontWeight: "500"
  }}
>
  <span style={{ color: "#00d4ff", fontWeight: "bold" }}>
    Challenge:
  </span>{" "}
  {selectedChallenge.question}
</div>
          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    fontFamily: "monospace",
    fontSize: "1rem",
  }}
>
  <div style={{
  marginTop: "30px",
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>

  {/* TIME - LEFT */}
  <div style={{ textAlign: "left" }}>
    <div style={{
      fontWeight: "bold",
      fontSize: "20px",
      marginBottom: "6px"
    }}>
      ⏱ Time in seconds
    </div>
    <div style={{
      fontFamily: "'Digital-7 Mono', monospace",
      fontSize: "30px",
      letterSpacing: "4px",
      backgroundColor: "#000",
      color: "#00ff66",
      padding: "8px 18px",
      borderRadius: "8px",
      textShadow: "0 0 10px #00ff66",
      display: "inline-block",
      minWidth: "120px",
      textAlign: "center"
    }}>
      {String(elapsedTime).padStart(2, "0")}
    </div>
  </div>

  {/* WPM - CENTER */}
  <div style={{ textAlign: "center" }}>
    <div style={{
      fontWeight: "bold",
      fontSize: "20px",
      marginBottom: "6px"
    }}>
      ⚡ WPM
    </div>
    <div style={{
      fontFamily: "'Digital-7 Mono', monospace",
      fontSize: "30px",
      letterSpacing: "4px",
      backgroundColor: "#000",
      color: "#00d4ff",
      padding: "8px 18px",
      borderRadius: "8px",
      textShadow: "0 0 10px #00d4ff",
      display: "inline-block",
      minWidth: "120px",
      textAlign: "center"
    }}>
      {String(wpm).padStart(2, "0")}
    </div>
  </div>

  {/* SCORE - RIGHT */}
  <div style={{ textAlign: "right" }}>
    <div style={{
      fontWeight: "bold",
      fontSize: "20px",
      marginBottom: "6px"
    }}>
      🎯 Score
    </div>
    <div style={{
      fontFamily: "'Digital-7 Mono', monospace",
      fontSize: "32px",
      letterSpacing: "6px",
      backgroundColor: "#000",
      color: "#ff1744",
      padding: "10px 24px",
      borderRadius: "10px",
      textShadow: "0 0 12px #ff1744",
      display: "inline-block",
      minWidth: "150px",
      textAlign: "center"
    }}>
      {String(score).padStart(3, "0")}
    </div>
  </div>

</div>
</div>
            <div className="typing-container">{renderColoredText()}</div>
            {/*<textarea
              rows="5"
              style={{
                width: "100%",
                marginTop: "1rem",
                padding: "1rem",
                fontSize: "1rem",
                fontFamily: "monospace",
              }}
              placeholder="Start typing here..."
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                if (!startTime && value.length === 1) {
                  setStartTime(Date.now());
                }
                setInput(value);
                if (value.length === sampleParagraph.length && !isTestComplete) {
                  completeTest(value);
                }
              }}
              disabled={isTestComplete}
            /> */}

            {!isTestComplete && (
              <button
                onClick={() => completeTest(input)}
                style={{
                  marginTop: "1rem",
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Submit Test
              </button>
            )}
            
            {isTestComplete && showSubmitButton && (
              <div style={{ marginTop: "1rem", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitScore}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ minWidth: 200 }}
                >
                  {isSubmitting ? "Submitting..." : "Submit to Leaderboard"}
                </Button>
                
                {!isSubmitting && (
                  <Button
                    variant="outlined"
                    color="secondary"
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
                    sx={{ minWidth: 120 }}
                  >
                    Retry
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
 
export default TypingTest;
