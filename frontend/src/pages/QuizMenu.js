"use client"

import React, { useState, useEffect } from "react"
import SyntaxSaverLesson from "./SyntaxSaverLesson"
import FourPicsGame from "./FourPicsGame"
import Crossword from "./CrosswordGame.js"

// ── Design tokens (reuse from dashboard) ──────────────────────────────────────
const T = {
  ink: "#1a1a2e",
  paper: "#f5f0e8",
  paperDark: "#ede7d9",
  paperMid: "#ddd5c5",
  accent: "#e8622a",
  accentDim: "#c44e1e",
  green: "#2d7a3a",
  blue: "#2563a8",
  amber: "#b45309",
  purple: "#7c3aed",
}

// ── Boot fonts + animations (same as dashboard) ───────────────────────────────
function boot() {
  if (!document.getElementById("st-fonts")) {
    const l = document.createElement("link")
    l.id = "st-fonts"
    l.rel = "stylesheet"
    l.href =
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap"
    document.head.appendChild(l)
  }

  if (!document.getElementById("quiz-kf")) {
    const s = document.createElement("style")
    s.id = "quiz-kf"
    s.textContent = `
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(16px) }
        to   { opacity:1; transform:translateY(0) }
      }
    `
    document.head.appendChild(s)
  }
}

// ── Quiz Card (Dashboard-style ModuleCard clone) ──────────────────────────────
function QuizCard({ icon, title, desc, color, onClick, delay }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer",
        borderRadius: 16,
        padding: "20px 18px",
        background: hov ? T.ink : "#fff",
        border: `2px solid ${hov ? T.ink : T.paperMid}`,
        boxShadow: hov
          ? `0 8px 0 ${T.accentDim}, 0 12px 30px rgba(0,0,0,.2)`
          : `0 4px 0 ${T.paperMid}`,
        transform: hov ? "translateY(-5px) scale(1.01)" : "none",
        transition: "all .2s cubic-bezier(.34,1.56,.64,1)",
        animation: `fadeUp .4s ease ${delay}s both`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* tag */}
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          padding: "3px 10px",
          borderRadius: 99,
          background: color + "22",
          color: hov ? "#fff" : color,
          border: `1px solid ${color}`,
          width: "fit-content",
        }}
      >
        QUIZ
      </span>

      {/* icon */}
      <div style={{ fontSize: "2rem" }}>{icon}</div>

      {/* title */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          color: hov ? T.paper : T.ink,
          lineHeight: 1.6,
        }}
      >
        {title}
      </div>

      {/* desc */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: hov ? "#7a8fa6" : "#999",
        }}
      >
        {desc}
      </div>

      {/* play text */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          color: T.accent,
          opacity: hov ? 1 : 0,
          transform: hov ? "translateX(0)" : "translateX(8px)",
          transition: "all .2s",
        }}
      >
        ▶ PLAY
      </div>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function QuizMenu() {
  const [selected, setSelected] = useState(null)

  useEffect(() => boot(), [])

  if (selected === "syntax") {
    return <SyntaxSaverLesson onBack={() => setSelected(null)} />
  }
  if (selected === "fourpics") {
    return <FourPicsGame onBack={() => setSelected(null)} />
  }
  if (selected === "crossword") {
    return <Crossword onBack={() => setSelected(null)} />
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: T.paper,
        minHeight: "100vh",
        padding: "40px 24px",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 12,
            color: T.ink,
          }}
        >
          🧠 Quiz Games
        </h2>

        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#888",
            marginTop: 6,
          }}
        >
          Select a challenge and test your coding knowledge.
        </p>

        {/* Grid */}
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <QuizCard
            icon="🧠"
            title="Code Block Assembly"
            desc="Arrange code into correct logic."
            color={T.blue}
            delay={0}
            onClick={() => setSelected("syntax")}
          />

          <QuizCard
            icon="🖼️"
            title="4 Pics 1 Word"
            desc="Guess the coding concept."
            color={T.green}
            delay={0.05}
            onClick={() => setSelected("fourpics")}
          />

          <QuizCard
            icon="📚"
            title="Crossword"
            desc="Solve programming clues."
            color={T.purple}
            delay={0.1}
            onClick={() => setSelected("crossword")}
          />
        </div>
      </div>
    </div>
  )
}
