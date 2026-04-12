import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Plus } from "lucide-react";
import { fetchInterview } from "../api";
import Loader from "../components/Loader";

const DIFF_COLOR = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };
const TYPE_COLOR = { conceptual: "#a78bfa", practical: "#38bdf8", behavioral: "#f59e0b" };
const COUNT_OPTIONS = [5, 10, 15];
const DIFF_OPTIONS = ["mixed", "easy", "medium", "hard"];

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="interview-card">
      <button className="interview-q-header" onClick={() => setOpen(o => !o)}>
        <div className="interview-q-meta">
          <span className="interview-q-num">Q{index + 1}</span>
          <span className="interview-badge" style={{ color: TYPE_COLOR[q.type], borderColor: `${TYPE_COLOR[q.type]}40` }}>{q.type}</span>
          <span className="interview-badge" style={{ color: DIFF_COLOR[q.difficulty], borderColor: `${DIFF_COLOR[q.difficulty]}40` }}>{q.difficulty}</span>
        </div>
        <p className="interview-q-text">{q.question}</p>
        {open ? <ChevronUp size={15} style={{ flexShrink: 0 }} /> : <ChevronDown size={15} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div className="interview-answer">
          <div className="interview-answer-text"><strong>Answer:</strong> {q.answer}</div>
          {q.key_points?.length > 0 && (
            <div className="interview-key-points">
              <strong>Key Points:</strong>
              <ul>{q.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {q.follow_up && (
            <div className="interview-followup">💬 <strong>Follow-up:</strong> {q.follow_up}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPage({ data: initialData, loading: initialLoading, topic, level }) {
  const [data, setData]           = useState(initialData);
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState("questions");
  const [count, setCount]         = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [appending, setAppending] = useState(false);

  const isLoading = initialLoading || loading;

  const generate = async (append = false) => {
    setLoading(true);
    try {
      const r = await fetchInterview(topic, level, count, difficulty);
      if (append && data) {
        setData(prev => ({ ...prev, questions: [...(prev.questions || []), ...(r.data.questions || [])] }));
      } else {
        setData(r.data);
      }
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
      setAppending(false);
    }
  };

  if (isLoading && !data) return <Loader text="Preparing your interview guide..." />;

  if (!data) return (
    <div className="page-empty">
      <div className="page-empty-icon">💼</div>
      <h3>No interview prep yet</h3>
      <p>Enter a topic and click Generate to start interview preparation.</p>
    </div>
  );

  return (
    <div className="interview-page">
      <div className="interview-header">
        <h2>{data.title}</h2>
        <p>{data.quick_summary}</p>
      </div>

      {/* Controls */}
      <div className="interview-controls">
        <div className="interview-control-group">
          <label>Questions</label>
          <div className="interview-count-btns">
            {COUNT_OPTIONS.map(n => (
              <button key={n} className={`ctrl-btn ${count === n ? "active" : ""}`} onClick={() => setCount(n)}>{n}</button>
            ))}
          </div>
        </div>
        <div className="interview-control-group">
          <label>Difficulty</label>
          <div className="interview-count-btns">
            {DIFF_OPTIONS.map(d => (
              <button
                key={d}
                className={`ctrl-btn ${difficulty === d ? "active" : ""}`}
                onClick={() => setDifficulty(d)}
                style={difficulty === d && d !== "mixed" ? { borderColor: DIFF_COLOR[d], color: DIFF_COLOR[d] } : {}}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="interview-ctrl-actions">
          <button className="generate-btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
            onClick={() => generate(false)} disabled={loading}>
            <RefreshCw size={14} /> {loading ? "Generating..." : "Regenerate"}
          </button>
          <button className="nav-btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
            onClick={() => { setAppending(true); generate(true); }} disabled={loading}>
            <Plus size={14} /> Add More
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="interview-tabs">
        {["questions", "cheatsheet", "tips"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "questions" ? `❓ Questions (${data.questions?.length || 0})` : t === "cheatsheet" ? "📋 Cheat Sheet" : "💡 Tips"}
          </button>
        ))}
      </div>

      {loading && <Loader text={appending ? "Adding more questions..." : "Regenerating..."} />}

      {!loading && tab === "questions" && (
        <div className="interview-questions">
          {data.questions?.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
        </div>
      )}

      {!loading && tab === "cheatsheet" && (
        <div className="cheatsheet">
          {data.cheat_sheet?.map((item, i) => (
            <div key={i} className="cheatsheet-item">
              <span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p>
            </div>
          ))}
          {data.common_mistakes?.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ color: "#ef4444", marginBottom: "0.75rem" }}>⚠️ Common Mistakes</h4>
              {data.common_mistakes.map((m, i) => (
                <div key={i} className="cheatsheet-item mistake"><span>!</span><p>{m}</p></div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && tab === "tips" && (
        <div className="interview-tips">
          {data.tips?.map((tip, i) => (
            <div key={i} className="tip-card">
              <span className="tip-num">{i + 1}</span><p>{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
