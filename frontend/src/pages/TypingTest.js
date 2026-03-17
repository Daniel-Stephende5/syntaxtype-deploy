import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/typingtest.css";
import { API_BASE } from "../utils/api";
import codeChallenges from "./codeChallenges";

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
        const res = await fetch(`${API_BASE}/api/challenges/falling/advanced`);
        if (!res.ok) throw new Error("Failed to fetch advanced falling challenges");
        const data = await res.json();
        setChallenges(data);
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
        const res = await fetch(
          `${API_BASE}/api/challenges/falling/advanced/${challenge.challengeId || challenge.id}`
        );
        if (!res.ok) throw new Error("Failed to load advanced falling challenge");
        const data = await res.json();
        sessionStorage.setItem("fallingChallenge", JSON.stringify(data));
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

    const accuracyPercent =
      totalChars > 0
        ? Math.round((correctChars / totalChars) * 100)
        : 0;

    const wordCount =
      trimmedInput.trim().split(/\s+/).filter(Boolean).length;

    const finalWpm =
      finalElapsed > 0
        ? Math.round((wordCount / finalElapsed) * 60)
        : 0;

    let timeMultiplier = 1;
    if (finalElapsed <= 60) timeMultiplier = 1;
    else if (finalElapsed <= 90) timeMultiplier = 0.95;
    else if (finalElapsed <= 120) timeMultiplier = 0.9;
    else timeMultiplier = 0.8;

    const finalScore = Math.min(
      100,
      Math.round(accuracyPercent * timeMultiplier)
    );

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
  };

  // (rest of your component unchanged)
};

export default TypingTest;
