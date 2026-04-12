import { useState } from "react";
import { fetchSelfCheck } from "../api";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div className={`selfcheck-card ${checked ? "checked" : ""}`}>
      <div className="selfcheck-q-row">
        <button
          className={`selfcheck-check ${checked ? "done" : ""}`}
          onClick={() => setChecked(!checked)}
          title="Mark as understood"
        >
          <CheckCircle size={18} />
        </button>
        <p className="selfcheck-q">
          <span className="selfcheck-num">Q{index + 1}.</span> {q.question}
        </p>
        <button className="selfcheck-toggle" onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{open ? "Hide" : "Answer"}</span>
        </button>
      </div>
      {open && (
        <div className="selfcheck-answer">
          <span className="tutor-tag">✅ Answer</span> {q.answer}
        </div>
      )}
    </div>
  );
}

export default function SelfCheck({ topic, level }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchSelfCheck(topic, level);
      setQuestions(r.data.questions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="selfcheck-wrap">
      <div className="selfcheck-header">
        <div>
          <h4>🧪 Self Check</h4>
          <p>Test your understanding before moving on</p>
        </div>
        {!questions && (
          <button className="generate-btn" onClick={load} disabled={loading} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        )}
      </div>

      {loading && (
        <div className="loader-wrap" style={{ padding: "1.5rem" }}>
          <div className="spinner" />
          <p>Preparing your self-check...</p>
        </div>
      )}

      {questions && (
        <>
          <div className="selfcheck-list">
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>
          <button
            className="tutor-btn"
            onClick={load}
            style={{ marginTop: "0.75rem" }}
          >
            🔄 Regenerate
          </button>
        </>
      )}
    </div>
  );
}
