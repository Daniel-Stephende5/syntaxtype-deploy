import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function GalaxyChallengeList() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({}); 

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/challenges/galaxy`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setChallenges(data || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const toggleDesc = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reusable button style for the "Play" word and other actions
  const btnStyle = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "1px solid #00ffff",
    background: "rgba(0, 128, 0)",
    color: "#FFFFFF",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
    display: "inline-block",
    transition: "0.2s"
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px", color: "#fff" }}>Loading challenges…</div>;
  
  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "#ff4444" }}>
        <div>Error: {error}</div>
        <button style={{ ...btnStyle, marginTop: "10px" }} onClick={fetchChallenges}>Retry</button>
      </div>
    );

  return (
    /* MAIN WRAPPER: Centers everything on the page */
    <div style={{ 
      maxWidth: "800px", 
      margin: "40px auto", 
      padding: "0 20px", 
      fontFamily: "monospace",
      color: "#fff" 
    }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ fontSize: "2rem", color: "#008000", margin: 0 }}>GALAXY CHALLENGES</h2>
        <button style={btnStyle} onClick={fetchChallenges}>REFRESH</button>
      </div>

      {challenges.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", border: "1px dashed #333" }}>
          No challenges available.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {challenges.map((c) => {
            const desc = c.description || "";
            const isLong = desc.length > 200;
            const isExpanded = !!expanded[c.id];
            
            return (
              <li key={c.id} style={{ 
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                marginBottom: "15px", 
                padding: "20px",
                border: "1px solid #333"
              }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffff00" }}>
                    {c.title || `CHALLENGE #${c.id}`}
                </div>

                {desc && (
                  <div style={{ color: "#ccc", marginTop: 10, lineHeight: "1.5" }}>
                    {isLong ? (isExpanded ? desc : desc.slice(0, 200) + "...") : desc}
                    {isLong && (
                      <button
                        onClick={() => toggleDesc(c.id)}
                        style={{ background: "transparent", color: "#00ffff", border: "none", cursor: "pointer", padding: "0 5px", fontSize: "12px" }}
                      >
                        {isExpanded ? "[Show less]" : "[Read more]"}
                      </button>
                    )}
                  </div>
                )}

                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  {/* PLAY BUTTON */}
                  <Link to={`/play/galaxy/${c.id}`} style={btnStyle}>
                    PLAY
                  </Link>

                  {/* SCORE BUTTON */}
                  <button 
                    style={{ ...btnStyle, borderColor: "#ccc", color: "#ccc", background: "transparent" }} 
                    onClick={() => { alert("Score display coming soon!"); }}
                  >
                    SCORE
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
