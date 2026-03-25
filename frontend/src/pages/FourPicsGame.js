import React, { useState, useEffect } from "react";
import { fourPicsOneWordData } from "./QuizData";

export default function FourPicsGame({ onBack }) {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false);

  // ✅ NEW STATES
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const current = fourPicsOneWordData[step];

  // 🔁 Reset per level
  useEffect(() => {
    setSlots(new Array(current.answer.length).fill(""));
    setFeedback("");
    setShowHint(false);
  }, [step, current.answer]);

  // ⏱ Start timer once
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // 🧩 Add letter
  const handleLetterClick = (letter) => {
    const index = slots.findIndex((s) => s === "");
    if (index === -1) return;
    const newSlots = [...slots];
    newSlots[index] = letter;
    setSlots(newSlots);
  };

  // ❌ Remove letter
  const handleSlotClick = (index) => {
    const newSlots = [...slots];
    newSlots[index] = "";
    setSlots(newSlots);
  };

  // 💡 Hint (with penalty)
  const handleUseHint = () => {
    if (hintsLeft <= 0) return;

    setShowHint(true);

    const answerArray = current.answer.split("");
    const idx = slots.findIndex((s, i) => s !== answerArray[i]);

    if (idx !== -1) {
      const newSlots = [...slots];
      newSlots[idx] = answerArray[idx];
      setSlots(newSlots);

      setHintsLeft((prev) => prev - 1);

      // ❗ penalty
      setScore((prev) => Math.max(prev - 2, 0));
    }
  };

  // ✅ Submit answer
  const handleSubmit = async () => {
    const userAnswer = slots.join("");

    if (userAnswer === current.answer) {
      setFeedback("✅ Correct!");

      // 🎯 Add score
      setScore((prev) => prev + 10);

      setTimeout(async () => {
        if (step < fourPicsOneWordData.length - 1) {
          setStep((prev) => prev + 1);
        } else {
          setFeedback("🎉 Completed!");

          // ⏱ Calculate time
          const endTime = Date.now();
          const timeInSeconds = Math.floor((endTime - startTime) / 1000);

          // 🚀 SEND TO BACKEND
          try {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/scores`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                score: score + 10, // include last answer
                timeInSeconds: timeInSeconds,
                challengeType: "fourpics",
                wpm: 0,
              }),
            });

            console.log("Score submitted!");
          } catch (err) {
            console.error("Error submitting score:", err);
          }
        }
      }, 800);
    } else {
      setFeedback("❌ Wrong answer!");
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>🖼️ 4 Pics 1 Word</h2>

      {/* 🧮 SCORE */}
      <div style={{ marginBottom: 10 }}>
        Score: <strong>{score}</strong>
      </div>

      {/* 💡 HINT COUNT */}
      <div style={{ marginBottom: 10 }}>
        Hints remaining: <strong>{hintsLeft}</strong>
      </div>

      {/* 🖼 IMAGES */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {current.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="clue"
            width={300}
            height={250}
            style={{ borderRadius: 10, border: "1px solid #ddd" }}
          />
        ))}
      </div>

      {/* 💡 HINT TEXT */}
      <div style={{ minHeight: "30px", marginBottom: 15 }}>
        {showHint ? (
          <p style={{ fontStyle: "italic", color: "#555" }}>💡 {current.hint}</p>
        ) : (
          <p style={{ color: "#aaa" }}>Hint is hidden</p>
        )}
      </div>

      {/* 🧩 SLOTS */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {slots.map((letter, i) => (
          <div
            key={i}
            onClick={() => handleSlotClick(i)}
            style={{
              width: 45,
              height: 45,
              borderBottom: "4px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: "bold",
              cursor: "pointer",
              background: "#f9f9f9",
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* 🔤 LETTER BANK */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        {current.letters.map((l, i) => (
          <button
            key={i}
            onClick={() => handleLetterClick(l)}
            style={{ padding: "10px 15px", fontSize: 16, cursor: "pointer" }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* 🎮 CONTROLS */}
      <div style={{ marginTop: 25 }}>
        <button
          onClick={handleSubmit}
          style={{
            marginRight: 10,
            padding: "10px 20px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Check Answer
        </button>

        <button
          onClick={handleUseHint}
          disabled={hintsLeft === 0}
          style={{
            marginRight: 10,
            padding: "10px 20px",
            background: hintsLeft > 0 ? "#ffc107" : "#eee",
            border: "none",
            borderRadius: 5,
            cursor: hintsLeft > 0 ? "pointer" : "not-allowed",
          }}
        >
          Use Hint ({hintsLeft})
        </button>
      </div>

      {/* 📢 FEEDBACK */}
      <p
        style={{
          marginTop: 15,
          fontWeight: "bold",
          color: feedback.includes("✅") ? "green" : "red",
        }}
      >
        {feedback}
      </p>

      {/* 🔙 BACK */}
      <button
        style={{
          marginTop: 20,
          background: "transparent",
          border: "1px solid #ccc",
          padding: "5px 10px",
          borderRadius: 4,
        }}
        onClick={onBack}
      >
        🔙 Back to Menu
      </button>
    </div>
  );
}
