import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/typingtest.css";
import { API_BASE } from "../utils/api";
import import codeChallenges from "./codeChallenges";
 
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
 
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
 
  // Fetch challenge list
  const fetchChallengeList = async (type) => {
    try {
      let url;
      if (type === "normal")  {setChallenges(codeChallenges);}
      else if (type === "falling") {url = `${API_BASE}/api/challenges/falling`;}
      else if (type === "advancedFalling"){ url = `${API_BASE}/api/challenges/falling/advanced`;}
      else throw new Error("Unknown challenge type");
 
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch challenges");
      const data = await res.json();
      setChallenges(data);
    } catch {
      setError("Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };
 
  // Load selected challenge
  const loadSelectedChallenge = async (challenge) => {
    try {
      let url;
      if (challengeType === "normal") {
        setSelectedChallenge(challenge);
     setBlankInputs(new Array(challenge.answers.length).fill("")); // one per blank
  setInput("");
  setIsTestComplete(false);
      } else if (challengeType === "falling") {
        url = `${API_BASE}/api/challenges/falling/${challenge.challengeId}`;
      } else if (challengeType === "advancedFalling") {
        url = `${API_BASE}/api/challenges/falling/advanced/${challenge.challengeId}`;
      } else {
        throw new Error("Unknown challenge type");
      }
 
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch challenge");
 
      const updatedChallenge = await res.json();
      setSelectedChallenge(updatedChallenge);
 
      if (challengeType === "normal") {
  setSampleParagraph(updatedChallenge.paragraph);
 
  // choose random words to blank
  const words = updatedChallenge.paragraph.split(" ");
  const numBlanks = Math.min(3, Math.floor(words.length / 5)); // 3 blanks or 20% of words
  const indices = new Set();
 
  while (indices.size < numBlanks) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (words[randomIndex].length > 3) indices.add(randomIndex);
  }
  setBlankIndices([...indices]);
} else {
        sessionStorage.setItem("fallingChallenge", JSON.stringify(updatedChallenge));
        navigate(
          challengeType === "falling"
            ? "/fallingtypingtest"
            : "/fallingtypingtest2"
        );
        return;
      }
 
      // Reset test state
      setInput("");
      setCorrectCount(0);
      setIsTestComplete(false);
      setStartTime(null);
      setElapsedTime(0);
      setWpm(0);
      setScore(0);
    } catch {
      setError("Failed to load challenge details.");
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
 
        // Update WPM live
        const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;
        const liveWpm = seconds > 0 ? Math.round((wordsTyped / seconds) * 60) : 0;
        setWpm(liveWpm);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isTestComplete, input]);
 
  // Fetch challenges on type change
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
  const completeTest = (finalInput) => {
    const endTime = Date.now();
    const finalElapsed = Math.floor((endTime - startTime) / 1000);
    const totalParagraphLength = sampleParagraph.length;
    const totalTyped = finalInput.length;
 
    let correct = 0;
    for (let i = 0; i < totalTyped; i++) {
      if (finalInput[i] === sampleParagraph[i]) {
        correct++;
      }
    }
 
    const accuracy = totalTyped > 0 ? correct / totalTyped : 0;
    const completeness =
      totalParagraphLength > 0 ? totalTyped / totalParagraphLength : 0;
    const finalScore = Math.round(accuracy * completeness * 100);
 
    const wordCount = finalInput.trim().split(/\s+/).filter(Boolean).length;
    const finalWpm =
      finalElapsed > 0 ? Math.round((wordCount / finalElapsed) * 60) : 0;
 
    setCorrectCount(correct);
    setElapsedTime(finalElapsed);
    setWpm(finalWpm);
    setIsTestComplete(true);
    setScore(finalScore);
 
    // Save score
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
  };
 
  // Colored text rendering
  // Colored text rendering with selective blanks and highlights
const renderColoredText = () => {
  if (!sampleParagraph) return null;
 
  const words = sampleParagraph.split(" ");
  let charIndex = 0;
 
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
      }}
    >
      {words.map((word, wordIndex) => {
        const isBlank = blankIndices.includes(wordIndex);
        const display = [];
 
        for (let i = 0; i < word.length; i++) {
          const typedChar = input[charIndex];
          const actualChar = word[i];
          let displayChar = actualChar;
          let color = "black";
 
          if (isBlank) {
            // For blanked words, show underscores until typed
            if (typedChar) {
              color = typedChar === actualChar ? "green" : "red";
            } else {
              displayChar = "_";
              color = "#ccc";
            }
          } else {
            // Normal word: highlight typed letters only
            if (typedChar) {
              color = typedChar === actualChar ? "green" : "red";
            }
          }
 
          display.push(
            <span key={charIndex} style={{ color }}>
              {displayChar}
            </span>
          );
          charIndex++;
        }
 
        // add a space between words
        display.push(<span key={`space-${wordIndex}`}> </span>);
        charIndex++;
 
        return <React.Fragment key={wordIndex}>{display}</React.Fragment>;
      })}
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
      {/* Navbar */}
      <nav className="navbar">
        <button className="hamburger-icon" onClick={toggleMenu}>☰</button>
        {isMenuOpen && (
          <div className="side-menu-overlay" onClick={toggleMenu}>
            <div className="side-menu" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={toggleMenu}>×</button>
              <nav className="menu-links">
                <Link to="/typingtest" onClick={toggleMenu}>Typing Test</Link>
                <Link to="/instructor" onClick={toggleMenu}>Instructor Module</Link>
                <Link to="/challenges" onClick={toggleMenu}>Challenges</Link>
                <Link to="/lesson" onClick={toggleMenu}>Create Lesson</Link>
              </nav>
            </div>
          </div>
        )}
        <div className="navbar-left">
          <h1 className="navbar-title">Typing Test</h1>
        </div>
        <div className="navbar-right">
          <button className="nav-button" onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>
      </nav>
 
      {/* Main Container */}
      <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
        {/* Tabs */}
        <div className="tab-buttons" style={{ padding: "50px" }}>
          <button
            className={`tab-button ${challengeType === "normal" ? "active" : ""}`}
            onClick={() => handleChallengeTypeChange("normal")}
          >
            Paragraph Typing Test
          </button>
          <button
            className={`tab-button ${challengeType === "falling" ? "active" : ""}`}
            onClick={() => handleChallengeTypeChange("falling")}
          >
            Falling Typing Test
          </button>
          <button
            className={`tab-button ${challengeType === "advancedFalling" ? "active" : ""}`}
            onClick={() => handleChallengeTypeChange("advancedFalling")}
          >
            Advanced Falling Typing Test
          </button>
        </div>
 
        {/* Challenge List */}
        {!selectedChallenge && (
          <div className="results-box">
            <h3>Select a challenge:</h3>
            <ul className="challenge-list">
              {challenges.map((challenge, index) => (
                <li key={index} className="challenge-item">
                  <span className="number-badge">{index + 1}</span>
                  <button
                    className="challenge-button"
                    onClick={() => loadSelectedChallenge(challenge)}
                  >
                    {challenge.title || `Challenge ${index + 1}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
 
        {/* Typing Interface */}
        {selectedChallenge && (
          <>
            <div className="typing-container">{renderColoredText()}</div>
            <textarea
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
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onDragOver={(e) => e.preventDefault()}
            />
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
 
            <div style={{ marginTop: "1rem" }}>
              <p>⏱ Time elapsed: {elapsedTime} seconds</p>
              <p>📈 WPM: {wpm}</p>
            </div>
 
            {isTestComplete && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Results</h3>
                <p>✅ Correct characters: {correctCount}</p>
                <p>⏱ Time taken: {elapsedTime} seconds</p>
                <p>📈 Final WPM: {wpm}</p>
                <p>
                  📏 Completion:{" "}
                  {sampleParagraph.length > 0
                    ? ((input.length / sampleParagraph.length) * 100).toFixed(2)
                    : "0.00"}
                  %
                </p>
                <p>🏁 Final Score: {score}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
 
export default TypingTest;
