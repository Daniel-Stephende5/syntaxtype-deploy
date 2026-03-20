import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function GalaxyChallengeList() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({}); // track expanded descriptions by id
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

  if (loading) return <div>Loading challenges…</div>;
  if (error)
    return (
      <div>
        <div>Error: {error}</div>
        <button onClick={fetchChallenges}>Retry</button>
      </div>
    );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Galaxy Challenges</h2>
        <button onClick={fetchChallenges}>Refresh</button>
      </div>

      {challenges.length === 0 ? (
        <div>No challenges available.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {challenges.map((c) => {
            const desc = c.description || "";
            const isLong = desc.length > 200;
            const isExpanded = !!expanded[c.id];
            return (
              <li key={c.id} style={{ borderBottom: "1px solid #333", padding: "12px 0" }}>
                <div style={{ fontWeight: 700 }}>{c.title || `Challenge #${c.id}`}</div>

                {desc && (
                  <div style={{ color: "#000", marginTop: 6 }}>
                    {isLong ? (isExpanded ? desc : desc.slice(0, 200) + "...") : desc}
                    {isLong && (
                      <div style={{ marginTop: 6 }}>
                        <button
                          onClick={() => toggleDesc(c.id)}
                          aria-expanded={isExpanded}
                          style={{ background: "transparent", color: "#9cf", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <Link to={`/play/galaxy/${c.id}`}>Play</Link>{" "}
                  <button style={{ marginLeft: 12 }} onClick={() => { /* TODO: show score */ }}>
                    Score
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
