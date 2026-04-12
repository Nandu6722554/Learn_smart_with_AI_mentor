import { useState } from "react";
import { Lightbulb, Play, RefreshCw } from "lucide-react";
import { fetchTryYourself } from "../api";

export default function TryYourself({ topic, subtopic }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const load = async () => {
    setLoading(true);
    setData(null);
    setHintVisible(false);
    try {
      const r = await fetchTryYourself(topic, subtopic);
      setData(r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="try-yourself">
      <div className="try-header">
        <span className="try-label"><Play size={13} /> Try Yourself</span>
        {!data && !loading && (
          <button className="tutor-btn" onClick={load}>Generate Challenge</button>
        )}
        {data && (
          <button className="tutor-btn" onClick={load} disabled={loading}>
            <RefreshCw size={12} /> New Challenge
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", color: "#64748b", fontSize: "0.85rem" }}>
          <span className="tutor-spinner" /> Generating challenge...
        </div>
      )}

      {data && (
        <div className="try-body">
          <p className="try-question">{data.question}</p>
          <button
            className={`hint-toggle ${hintVisible ? "open" : ""}`}
            onClick={() => setHintVisible(!hintVisible)}
          >
            <Lightbulb size={13} />
            {hintVisible ? "Hide Hint" : "Show Hint"}
          </button>
          {hintVisible && (
            <div className="try-hint">
              💡 {data.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
