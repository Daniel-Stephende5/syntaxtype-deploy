import React, { useState, useEffect } from "react";
import { fourPicsOneWordData } from "./QuizData";

export default function FourPicsGame({ onBack }) {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false); // 👈 New state to hide/show text

  const current = fourPicsOneWordData[step];

  // Reset for every new level
  useEffect(() => {
    setSlots(new Array(current.answer.length).fill(""));
    setFeedback("");
    setShowHint(false); // 👈 Hide hint text again for the new level
  }, [step, current.answer]);

  const handleLetterClick = (letter) => {
    const index = slots.findIndex((s) => s === "");
    if (index === -1) return;
    const newSlots = [...slots];
    newSlots[index] = letter;
    setSlots(newSlots);
  };

  const handleSlotClick = (index) => {
    const newSlots = [...slots];
    newSlots[index] = "";
    setSlots(newSlots);
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0) return;

    // 1. Reveal the text hint
    setShowHint(true); 

    // 2. Reveal one correct letter in the slots
    const answerArray = current.answer.split("");
    const firstEmptyOrWrongIndex = slots.findIndex((s, i) => s !== answerArray[i]);

    if (firstEmptyOrWrongIndex !== -1) {
      const newSlots = [...slots];
      newSlots[firstEmptyOrWrongIndex] = answerArray[firstEmptyOrWrongIndex];
      setSlots(newSlots);
      setHintsLeft(hintsLeft - 1);
    }
  };

  const handleSubmit = () => {
    const userAnswer = slots.join("");
    if (userAnswer === current.answer) {
      setFeedback("✅ Correct!");
      setTimeout(() => {
        if (step < fourPicsOneWordData.length - 1) {
          setStep(step + 1);
        } else {
          setFeedback("🎉 Completed!");
        }
      }, 800);
    } else {
      setFeedback("❌ Wrong answer!");
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>🖼️ 4 Pics 1 Word</h2>
      
      <div style={{ marginBottom: 10 }}>
        Hints remaining: <strong>{hintsLeft}</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {current.images.map((img, i) => (
          <img key={i} src={img} alt="clue" width={180} height={180} style={{ borderRadius: 10, border: '1px solid #ddd' }} />
        ))}
      </div>

      {/* 💡 Hint Text: Only shows if showHint is true */}
      <div style={{ minHeight: "30px", marginBottom: 15 }}>
        {showHint ? (
          <p style={{ fontStyle: "italic", color: "#555" }}>💡 {current.hint}</p>
        ) : (
          <p style={{ color: "#aaa" }}>Hint is hidden</p>
        )}
      </div>

      {/* Slots */}
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
              background: "#f9f9f9"
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Letter Bank */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", maxWidth: 500, margin: "0 auto" }}>
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

      <div style={{ marginTop: 25 }}>
        <button onClick={handleSubmit} style={{ marginRight: 10, padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
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
            cursor: hintsLeft > 0 ? "pointer" : "not-allowed"
          }}
        >
          Use Hint ({hintsLeft})
        </button>
      </div>

      <p style={{ marginTop: 15, fontWeight: "bold", color: feedback.includes("✅") ? "green" : "red" }}>
        {feedback}
      </p>

      <button style={{ marginTop: 20, background: "transparent", border: "1px solid #ccc", padding: "5px 10px", borderRadius: 4 }} onClick={onBack}>
        🔙 Back to Menu
      </button>
    </div>
  );
}
