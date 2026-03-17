import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/typingtest.css";
import { API_BASE } from "../utils/api";
import codeChallenges from "./codeChallenges";

const TypingTest = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [input, setInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challengeType, setChallengeType] = useState("normal");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [score, setScore] = useState(0);
  const [blankInputs, setBlankInputs] = useState([]);
  const [showCursor, setShowCursor] = useState(true);

  const navigate = useNavigate();

  // ✅ Fetch challenge list
  const fetchChallengeList = async (type) => {
    setError(null);
    try {
      if (type === "normal") {
        setChallenges(codeChallenges);
      } else if (type === "falling") {
        const res = await fetch(`${API_BASE}/api/challenges/falling`);
        if (!res.ok) throw new Error("Failed to fetch falling challenges");
        setChallenges(await res.json());
      } else if (type === "advancedFalling") {
        const res = await fetch(`${API_BASE}/api/challenges/falling/advanced`);
        if (!res.ok) throw new Error("Failed to fetch advanced challenges");
        setChallenges(await res.json());
      }
    } catch (err) {
      setError(err.message);
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
        const res = await fetch(
          `${API_BASE}/api/challenges/falling/advanced/${challenge.challengeId || challenge.id}`
        );
        if (!res.ok) throw new Error("Failed to load advanced challenge");

        const data = await res.json();
        sessionStorage.setItem("fallingChallenge", JSON.stringify(data));
        navigate("/fallingtypingtest2");
        return;
      }

      // reset stats
      setCorrectCount(0);
      setStartTime(null);
      setElapsedTime(0);
      setWpm(0);
      setScore(0);

    } catch (err) {
      setError(err.message);
    }
  };

  // ⏱ Timer
  useEffect(() => {
    let timer;
    if (startTime && !isTestComplete) {
      timer = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(seconds);

        const words = input.length / 5;
        setWpm(seconds > 0 ? Math.round((words / seconds) * 60) : 0);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isTestComplete, input]);

  // ⌨️ Input handler
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

  // ⌨️ Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 🔄 Fetch on type change
  useEffect(() => {
    setLoading(true);
    fetchChallengeList(challengeType);
    setSelectedChallenge(null);
    setInput("");
    setCorrectCount(0);
    setIsTestComplete(false);
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setScore(0);
  }, [challengeType]);

  // ✅ Complete test
  const completeTest = () => {
    if (!selectedChallenge || !startTime) return;

    const time = Math.floor((Date.now() - startTime) / 1000);
    const { code, answers } = selectedChallenge;

    let expected = code;
    answers.forEach(a => {
      expected = expected.replace("___", a);
    });

    const trimmed = input.slice(0, expected.length);

    let correct = 0;
    for (let i = 0; i < expected.length; i++) {
      if (trimmed[i] === expected[i]) correct++;
    }

    const accuracy = Math.round((correct / expected.length) * 100);
    const words = trimmed.split(/\s+/).length;
    const finalWpm = Math.round((words / time) * 60);

    const finalScore = Math.min(100, accuracy);

    setCorrectCount(correct);
    setElapsedTime(time);
    setWpm(finalWpm);
    setScore(finalScore);
    setIsTestComplete(true);

    // ✅ submit score
    fetch(`${API_BASE}/api/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: finalScore,
        timeInSeconds: time,
        challengeType: "normal",
      }),
    });
  };

  // 🎨 Render code
  const renderColoredText = () => {
    if (!selectedChallenge) return null;

    const { code, answers } = selectedChallenge;
    const parts = code.split("___");

    let index = 0;

    return (
      <div className="typing-container">
        {parts.map((part, i) => (
          <span key={i}>
            {part.split("").map((char, j) => {
              const typed = input[index];
              const color = typed ? (typed === char ? "green" : "red") : "black";
              index++;
              return <span key={j} style={{ color }}>{char}</span>;
            })}

            {i < parts.length - 1 &&
              answers[i].split("").map((char, j) => {
                const typed = input[index];
                const color = typed ? (typed === char ? "green" : "red") : "gray";
                index++;
                return <span key={j} style={{ color }}>{typed || "_"}</span>;
              })}
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      {!selectedChallenge && challenges.map((c) => (
        <button key={c.id} onClick={() => loadSelectedChallenge(c)}>
          {c.question}
        </button>
      ))}

      {selectedChallenge && (
        <>
          <h3>{selectedChallenge.question}</h3>
          {renderColoredText()}

          {!isTestComplete && (
            <button onClick={completeTest}>Submit</button>
          )}
        </>
      )}
    </div>
  );
};

export default TypingTest;
