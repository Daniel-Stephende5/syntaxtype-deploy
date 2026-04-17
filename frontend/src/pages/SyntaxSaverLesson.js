"use client"

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { lessons as quizLessons, quizTitle } from "./QuizData";
import CodeWormBattle from "./CodeWormBattle";
import "./SyntaxSaverLesson.css";

// ── Design Tokens (same as dashboard) ─────────────────────────────────────────
const T = {
  ink: "#1a1a2e",
  paper: "#f5f0e8",
  paperDark: "#ede7d9",
  paperMid: "#ddd5c5",
  accent: "#e8622a",
  accentDim: "#c44e1e",
  green: "#2d7a3a",
  red: "#b91c1c",
  blue: "#2563a8",
};

// ── Boot fonts ────────────────────────────────────────────────────────────────
function boot() {
  if (!document.getElementById("st-fonts")) {
    const l = document.createElement("link");
    l.id = "st-fonts";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap";
    document.head.appendChild(l);
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function SyntaxSaverLesson({ onBack }) {
  const [resetKey, setResetKey] = useState(0);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  const lessons = quizLessons;
  const current = lessons[step];

  useEffect(() => boot(), []);

  const handleNext = (points = 0) => {
    setScore(prev => prev + points);
    setFeedback("");
    if (step < lessons.length - 1) setStep(prev => prev + 1);
    else setFeedback("🎉 Lesson Complete!");
  };

  const handleBackStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      setFeedback("");
    }
  };

  const handleBackToMenu = () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to exit the lesson? Your progress will be lost."
    );
    if (confirmLeave) {
      setStep(0);
      setScore(0);
      setFeedback("");
      setResetKey(prev => prev + 1);
      onBack();
    }
  };

  return (
    <div className="st-lesson-bg">
      <div className="st-lesson-card" key={resetKey}>

        {/* HEADER */}
        <div className="st-header">
          <h2>🧠 {quizTitle}</h2>
          <p>Step {step + 1} / {lessons.length}</p>
        </div>

        {/* CONTENT */}
        {current.type === "match" && (
          <MatchQuestion data={current} onNext={handleNext} setFeedback={setFeedback} />
        )}
        {current.type === "reorder" && (
          <ReorderQuestion data={current} onNext={handleNext} setFeedback={setFeedback} />
        )}
        {current.type === "battle" && (
          <CodeWormBattle onNext={handleNext} />
        )}

        {/* FEEDBACK */}
        <div className="st-feedback">{feedback}</div>

        {/* SCORE */}
        <div className="st-score">⭐ Score: {score}</div>

        {/* NAV */}
        <div className="st-actions">
          {step > 0 && (
            <button onClick={handleBackStep} className="st-btn secondary">
              ⬅ Previous
            </button>
          )}
          <button onClick={handleBackToMenu} className="st-btn danger">
            🏠 Menu
          </button>
        </div>

      </div>
    </div>
  );
}

// ── MatchQuestion ─────────────────────────────────────────────────────────────
function MatchQuestion({ data, onNext, setFeedback }) {
  const normalize = s => (s ?? "").toString().trim().toLowerCase();

  const handleClick = opt => {
    if (normalize(opt) === normalize(data.correct)) {
      setFeedback("✅ Correct!");
      onNext(10);
    } else {
      setFeedback("❌ Incorrect! Moving on...");
      onNext(0);
    }
  };

  return (
    <div className="st-question">
      <h3>{data.question}</h3>

      <div className="st-options">
        {data.options.map((opt, i) => (
          <button key={i} onClick={() => handleClick(opt)} className="st-btn">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ReorderQuestion ───────────────────────────────────────────────────────────
const scramble = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function ReorderQuestion({ data, onNext, setFeedback }) {
  const [order, setOrder] = useState([]);

  useEffect(() => setOrder(scramble(data.parts)), [data.parts]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setOrder(newOrder);
  };

  const handleSubmit = () => {
    if (JSON.stringify(order) === JSON.stringify(data.parts)) {
      setFeedback("✅ Correct!");
      onNext(15);
    } else {
      setFeedback("❌ Not correct. Moving on...");
      onNext(0);
    }
  };

  return (
    <div className="st-question">
      <h3>{data.question}</h3>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="st-drag-area"
            >
              {order.map((part, index) => (
                <Draggable key={index} draggableId={`part-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`st-code-block ${snapshot.isDragging ? "dragging" : ""}`}
                    >
                      {part}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button onClick={handleSubmit} className="st-btn primary">
        Check Order
      </button>
    </div>
  );
}
