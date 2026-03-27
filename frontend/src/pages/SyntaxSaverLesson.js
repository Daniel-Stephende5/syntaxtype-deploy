import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { lessons as quizLessons, quizTitle } from "./QuizData";
import CodeWormBattle from "./CodeWormBattle";

export default function SyntaxSaverLesson({ onBack }) {
  // --- force remount key ---
  const [resetKey, setResetKey] = useState(0);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  const lessons = quizLessons;
  const current = lessons[step];

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
      // Reset state before leaving
      setStep(0);
      setScore(0);
      setFeedback("");
      setResetKey(prev => prev + 1); // force remount
      onBack();
    }
  };

  return (
     <div className="lesson-container"> {/* NEW */}
    <div className="lesson-card" key={resetKey}> {/* UPDATED */}
      <h2>🧠 {quizTitle}</h2>
      <p>Step {step + 1} of {lessons.length}</p>

      {current.type === "match" && (
        <MatchQuestion data={current} onNext={handleNext} setFeedback={setFeedback} />
      )}
      {current.type === "reorder" && (
        <ReorderQuestion data={current} onNext={handleNext} setFeedback={setFeedback} />
      )}
      {current.type === "battle" && (
        <CodeWormBattle blocks={current.blocks} scrambled={current.scrambled} onNext={handleNext} />
      )}

      <p className="feedback">{feedback}</p>
      <p className="score">⭐ Score: {score}</p>

      <div className="lesson-buttons">
        {step > 0 && <button onClick={handleBackStep}>⬅️ Previous</button>}
        <button onClick={handleBackToMenu}>🏠 Menu</button>
      </div>
    </div>
  </div>
  );
}

// --- MatchQuestion ---
function MatchQuestion({ data, onNext, setFeedback }) {
  const normalize = s => (s ?? "").toString().trim().toLowerCase();
  const handleClick = opt => {
    if (normalize(opt) === normalize(data.correct)) {
      setFeedback("✅ Correct!");
      onNext(10);
    } else setFeedback("❌ Try again!");
  };

  return (
    <div className="question">
      <h3>{data.question}</h3>
      <div className="options">
        {data.options.map((opt, i) => (
          <button key={i} onClick={() => handleClick(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

// --- ReorderQuestion ---
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
      setFeedback("❌ Not correct. Try again.");
    }
  };

  return (
    <div className="question">
      <h3>{data.question}</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}
            >
              {order.map((part, index) => (
                <Draggable key={index} draggableId={`part-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: "8px 12px",
                        background: snapshot.isDragging ? "#9fe3ff" : "#0c5b0bff",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: 4,
                        cursor: "grab",
                        userSelect: "none",
                        ...provided.draggableProps.style
                      }}
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
      <button onClick={handleSubmit}>Check Order</button>
    </div>
  );
}
