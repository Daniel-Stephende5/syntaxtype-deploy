import React, { useState, useEffect } from "react";
import { fourPicsOneWordData } from "./QuizData";

export default function FourPicsGame({ onBack }) {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [hintsLeft, setHintsLeft] = useState(3); // 💡 Limited to 3 hints total

  const current = fourPicsOneWordData[step];

  // Initialize or Reset slots when level changes
  useEffect(() => {
    setSlots(new Array(current.answer.length).fill(""));
    setFeedback("");
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

  // 💡 Hint Logic: Reveals the next correct letter
  const handleUseHint = () => {
    if (hintsLeft <= 0) return;

    const answerArray = current.answer.split("");
    // Find first slot that is empty OR wrong
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
          setFeedback("🎉 Completed all levels!");
        }
      }, 800);
    } else {
      setFeedback("❌ Wrong answer!");
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>🖼️ 4 Pics 1 Word</h2>
      
      {/* Hint Tracker */}
      <div style={{ marginBottom: 10, color: hintsLeft > 0 ? "black" : "red" }}>
        Hints remaining: <strong>{hintsLeft}</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        {current.images.map((img, i) => (
          <img key={i} src={img} alt="clue" width={150} height={150} style={{ borderRadius: 8 }} />
        ))}
      </div>

      <p style={{ marginTop: 10, fontStyle: "italic" }}>💡 {current.hint}</p>

      {/* Slots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 5, margin: "20px 0" }}>
        {slots.map((letter, i) => (
          <div
            key={i}
            onClick={() => handleSlotClick(i)}
            style={{
              width: 40,
              height: 40,
              border: "2px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: feedback === "✅ Correct!" ? "#d4edda" : "white"
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Letter Bank */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", maxWidth: 400, margin: "0 auto" }}>
        {current.letters.map((l, i) => (
          <button key={i} onClick={() => handleLetterClick(l)} style={{ padding: "10px 15px" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20 }}>
        <button onClick={handleSubmit} style={{ marginRight: 10, padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: 5 }}>
          Check
        </button>
        
        {/* Hint Button */}
        <button 
          onClick={handleUseHint} 
          disabled={hintsLeft === 0}
          style={{ 
            marginRight: 10, 
            padding: "10px 20px", 
            background: hintsLeft > 0 ? "#ffc107" : "#ccc",
            cursor: hintsLeft > 0 ? "pointer" : "not-allowed"
          }}
        >
          Use Hint ({hintsLeft})
        </button>

        <button onClick={() => setSlots(new Array(current.answer.length).fill(""))}>
          Reset
        </button>
      </div>

      <p style={{ marginTop: 15, fontSize: 18 }}>{feedback}</p>

      <button style={{ marginTop: 20 }} onClick={onBack}>🔙 Back</button>
    </div>
  );
}
