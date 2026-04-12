import { useState } from "react";
import { fetchAutoPractice, fetchCheckAnswer } from "../api";
import CodeBlock from "./CodeBlock";
import { Lightbulb, Send, RefreshCw, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const DIFF_COLOR = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

function FeedbackPanel({ fb }) {
  if (!fb) return null;
  if (fb.is_correct) {
    return (
      <div className="pg-feedback correct">
        <div className="pg-fb-row"><CheckCircle size={16} className="pg-fb-icon correct" /><strong>Correct!</strong></div>
        {fb.correct_approach && <div className="pg-fb-section"><span className="pg-fb-label">✅ Why it's correct</span><p>{fb.correct_approach}</p></div>}
        {fb.optimization_tip && <div className="pg-fb-section"><span className="pg-fb-label">🚀 Optimization tip</span><p>{fb.optimization_tip}</p></div>}
      </div>
    );
  }
  return (
    <div className="pg-feedback wrong">
      {fb.mistake_type && <div className="pg-fb-row"><XCircle size={16} className="pg-fb-icon wrong" /><strong>Mistake: {fb.mistake_type}</strong></div>}
      {fb.what_user_did    && <div className="pg-fb-section"><span className="pg-fb-label">🤔 What you did</span><p>{fb.what_user_did}</p></div>}
      {fb.why_it_is_wrong  && <div className="pg-fb-section"><span className="pg-fb-label">⚠️ Why it's wrong</span><p>{fb.why_it_is_wrong}</p></div>}
      {fb.correct_approach && <div className="pg-fb-section"><span className="pg-fb-label">✅ Correct approach</span><p>{fb.correct_approach}</p></div>}
      {fb.step_by_step_fix?.length > 0 && (
        <div className="pg-fb-section"><span className="pg-fb-label">🔧 Fix steps</span>
          <ol>{fb.step_by_step_fix.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      )}
      {fb.correct_solution && <div className="pg-fb-section"><span className="pg-fb-label">📘 Correct solution</span><CodeBlock code={fb.correct_solution} label="Solution" /></div>}
      {fb.prevention_tip && <div className="pg-fb-section prevention"><span className="pg-fb-label">💡 Prevention tip</span><p>{fb.prevention_tip}</p></div>}
    </div>
  );
}

function TaskCard({ task, index, topic, onCorrect }) {
  const [answer, setAnswer]     = useState("");
  const [hint, setHint]         = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const check = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const r = await fetchCheckAnswer(topic, task.problem, answer);
      setFeedback(r.data);
      setDone(true);
      if (r.data.is_correct) onCorrect?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`task-card ${done ? (feedback?.is_correct ? "task-correct" : "task-wrong") : ""}`}>
      <div className="task-header">
        <span className="task-num">Q{index + 1}</span>
        <span className="badge" style={{ background: `${DIFF_COLOR[task.difficulty]}20`, color: DIFF_COLOR[task.difficulty], border: `1px solid ${DIFF_COLOR[task.difficulty]}40` }}>
          {task.difficulty}
        </span>
        <h4>{task.title}</h4>
        {done && (feedback?.is_correct
          ? <CheckCircle size={15} color="#10b981" style={{ marginLeft: "auto" }} />
          : <XCircle size={15} color="#ef4444" style={{ marginLeft: "auto" }} />
        )}
      </div>

      <p className="task-problem">{task.problem}</p>

      {task.expected_approach && (
        <p className="task-approach">💭 Approach: {task.expected_approach}</p>
      )}

      <div className="task-answer-area">
        <textarea
          className="task-answer-input"
          placeholder="Write your answer or code here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={4}
          disabled={loading || done}
        />
        <div className="task-actions">
          <button className={`hint-toggle ${hint ? "open" : ""}`} onClick={() => setHint(v => !v)}>
            <Lightbulb size={13} /> {hint ? "Hide Hint" : "Show Hint"}
          </button>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {done && <button className="tutor-btn" onClick={() => { setAnswer(""); setFeedback(null); setDone(false); setHint(false); }}><RefreshCw size={12} /> Retry</button>}
            {!done && (
              <button className="generate-btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                onClick={check} disabled={loading || !answer.trim()}>
                <Send size={14} /> {loading ? "Checking..." : "Check Answer"}
              </button>
            )}
          </div>
        </div>
        {hint && <div className="try-hint">💡 {task.hint}</div>}
      </div>

      <FeedbackPanel fb={feedback} />
    </div>
  );
}

export default function AutoPractice({ topic, level, onPractice }) {
  const [tasks, setTasks]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore]   = useState(0);

  const generate = async () => {
    setLoading(true);
    setTasks(null);
    setScore(0);
    try {
      const r = await fetchAutoPractice(topic, level);
      setTasks(r.data.tasks);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = () => {
    setScore(s => s + 1);
    onPractice?.();
  };

  return (
    <div className="auto-practice">
      <div className="auto-practice-header">
        <div>
          <h3>🎯 Auto Practice</h3>
          <p>AI-generated questions from easy → hard. Answer and get instant feedback.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {tasks && <span className="practice-score">{score}/{tasks.length} correct</span>}
          <button className="generate-btn" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
            onClick={generate} disabled={loading}>
            <ChevronRight size={14} /> {loading ? "Generating..." : tasks ? "New Set" : "Generate Practice"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loader-wrap" style={{ padding: "2rem" }}>
          <div className="spinner" /><p>Generating practice questions...</p>
        </div>
      )}

      {tasks && (
        <div className="practice-list">
          {tasks.map((task, i) => (
            <TaskCard key={i} task={task} index={i} topic={topic} onCorrect={handleCorrect} />
          ))}
        </div>
      )}
    </div>
  );
}
