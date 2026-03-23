import React, { useState } from "react";
import { fourPicsOneWordData } from "./QuizData";


export default function FourPicsGame({ onBack }) {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState(fourPicsOneWordData[0].slots);
  const [feedback, setFeedback] = useState("");

  const current = fourPicsOneWordData[step];

  // 👉 Fill next empty slot
  const handleLetterClick = (letter) => {
    const index = slots.findIndex((s) => s === "");
    if (index === -1) return;

    const newSlots = [...slots];
    newSlots[index] = letter;
    setSlots(newSlots);
  };

  // 👉 Remove letter from slot
  const handleSlotClick = (index) => {
    const newSlots = [...slots];
    newSlots[index] = "";
    setSlots(newSlots);
  };

  // 👉 Check answer
  const handleSubmit = () => {
    const userAnswer = slots.join("");

    if (userAnswer === current.answer) {
      setFeedback("✅ Correct!");
      setTimeout(() => {
        if (step < fourPicsOneWordData.length - 1) {
          const next = step + 1;
          setStep(next);
          setSlots(fourPicsOneWordData[next].slots);
          setFeedback("");
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

      {/* Images */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {current.images.map((img, i) => (
          <img key={i} src={img} alt="clue" width={120} height={120} />
        ))}
      </div>

      {/* Hint */}
      <p style={{ marginTop: 10, fontStyle: "italic" }}>
        💡 {current.hint}
      </p>

      {/* Slots */}
      <div className="slots-container">
        {slots.map((letter, i) => (
          <div
            key={i}
            className="slot-box"
            onClick={() => handleSlotClick(i)}
            style={{
              borderBottom:
                feedback === "❌ Wrong answer!"
                  ? "4px solid red"
                  : feedback === "✅ Correct!"
                  ? "4px solid green"
                  : "4px solid #333",
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Letter Bank */}
      <div className="letter-bank">
        {current.letters.map((l, i) => (
          <button
            key={i}
            className="letter-btn"
            onClick={() => handleLetterClick(l)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 15 }}>
        <button onClick={handleSubmit} style={{ marginRight: 10 }}>
          Check
        </button>
        <button onClick={() => setSlots(current.slots)}>Reset</button>
      </div>

      {/* Feedback */}
      <p style={{ marginTop: 10, fontWeight: "bold" }}>{feedback}</p>

      <button style={{ marginTop: 20 }} onClick={onBack}>
        🔙 Back
      </button>
    </div>
  );
}
