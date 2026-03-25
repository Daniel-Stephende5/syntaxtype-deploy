import React, { useState } from "react";
import SyntaxSaverLesson from "./SyntaxSaverLesson";
import FourPicsGame from "./FourPicsGame";
import "./SyntaxSaverLesson.css";

import Crossword from "./CrosswordGame.js;

export default function QuizMenu() {
  const [selected, setSelected] = useState(null);

  // 👉 Navigation
  if (selected === "syntax") {
    return <SyntaxSaverLesson onBack={() => setSelected(null)} />;
  }

  if (selected === "fourpics") {
    return <FourPicsGame onBack={() => setSelected(null)} />;
  }
  if (selected === "crossword") {
    return <Crossword onBack={() => setSelected(null)} />;
  }

  return (
    <div className="quiz-menu">
      <h2>🧠 Quiz Games</h2>
      <p>Select a quiz to begin your coding journey!</p>

      <div className="quiz-list">
        
        {/* ✅ ITEM 1: Syntax Saver */}
        <button
          className="quiz-item"
          onClick={() => setSelected("syntax")}
        >
          🧠 Syntax Saver Challenge
        </button>

        {/* ✅ ITEM 2: 4 Pics */}
        <button
          className="quiz-item special"
          onClick={() => setSelected("fourpics")}
        >
          🖼️ 4 Pics 1 Word
        </button>
        {/* ✅ ITEM 2: 4 Pics */}
        <button
          className="bookworm"
          onClick={() => setSelected("bookworm")}
        >
          🖼️ Crossword
        </button>

      </div>
    </div>
  );
}
