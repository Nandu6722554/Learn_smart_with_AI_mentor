import { useState } from "react";
import { fetchCheckAnswer } from "../api";
import CodeBlock from "./CodeBlock";
import { Lightbulb, Send, RefreshCw, CheckCircle, XCircle } from "lucide-react";

function FeedbackPanel({ fb }) {
  if (!fb) return null;

  if (fb.is_correct) {
    return (
      <div className="pg-feedback correct">
        <div className="pg-fb-row">
          <CheckCircle size={18} className="pg-fb-icon correct" />
          <strong>Correct!</strong>
        </div>
        {fb.correct_approach && (
          <div className="pg-fb-section">
            <span className="pg-fb-label">✅ Why it's correct</span>
            <p>{fb.correct_approach}</p>
          </div>
        )}
        {fb.optimization_tip && (
          <div className="pg-fb-section">
            <span className="pg-fb-label">🚀 Optimization tip</span>
            <p>{fb.optimization_tip}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pg-feedback wrong">
      {fb.mistake_type && (
        <div className="pg-fb-row">
          <XCircle size={18} className="pg-fb-icon wrong" />
          <strong>Mistake: {fb.mistake_type}</strong>
        </div>
      )}
      {fb.what_user_did && (
        <div className="pg-fb-section">
          <span className="pg-fb-label">🤔 What you did</span>
          <p>{fb.what_user_did}</p>
        </div>
      )}
      {fb.why_it_is_wrong && (
        <div className="pg-fb-section">
          <span className="pg-fb-label">⚠️ Why it's wrong</span>
          <p>{fb.why_it_is_wrong}</p>
        </div>
      )}
      {fb.correct_approach && (
        <div className="pg-fb-section">
          <span className="pg-fb-label">✅ Correct approach</span>
          <p>{fb.correct_approach}</p>
        </div>
      )}
      {fb.step_by_step_fix?.length > 0 && (
        <div className="pg-fb-section">
          <span className="pg-fb-label">🔧 Fix steps</span>
          <ol>{fb.step_by_step_fix.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      )}
      {fb.correct_solution && (
        <div className="pg-fb-section">
          <span className="pg-fb-label">📘 Correct solution</span>
          <CodeBlock code={fb.correct_solution} label="Solution" />
        </div>
      )}
      {fb.prevention_tip && (
        <div className="pg-fb-section prevention">
          <span className="pg-fb-label">💡 Prevention tip</span>
          <p>{fb.prevention_tip}</p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, index, topic, onPractice }) {
  const [answer, setAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const checkAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const r = await fetchCheckAnswer(topic, task.problem, answer);
      setFeedback(r.data);
      setAttempted(true);
      onPractice?.();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setAnswer(""); setFeedback(null); setHintVisible(false); setAttempted(false); };

  const diffColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

  return (
    <div className={`task-card ${attempted ? (feedback?.is_correct ? "task-correct" : "task-wrong") : ""}`}>
      <div className="task-header">
        <span className="task-num">Task {index + 1}</span>
        <span className="badge" style={{ background: `${diffColor[task.difficulty]}20`, color: diffColor[task.difficulty], border: `1px solid ${diffColor[task.difficulty]}40` }}>
          {task.difficulty}
        </span>
        <h4>{task.title}</h4>
        {attempted && (
          feedback?.is_correct
            ? <CheckCircle size={16} color="#10b981" style={{ marginLeft: "auto" }} />
            : <XCircle size={16} color="#ef4444" style={{ marginLeft: "auto" }} />
        )}
      </div>

      <p className="task-problem">{task.problem}</p>

      {/* Answer input */}
      <div className="task-answer-area">
        <textarea
          className="task-answer-input"
          placeholder="Write your answer or code here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={5}
          disabled={loading}
        />
        <div className="task-actions">
          <button
            className={`hint-toggle ${hintVisible ? "open" : ""}`}
            onClick={() => setHintVisible(v => !v)}
          >
            <Lightbulb size={13} /> {hintVisible ? "Hide Hint" : "Show Hint"}
          </button>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {attempted && (
              <button className="tutor-btn" onClick={reset}>
                <RefreshCw size={12} /> Try Again
              </button>
            )}
            <button
              className="generate-btn"
              style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
              onClick={checkAnswer}
              disabled={loading || !answer.trim()}
            >
              <Send size={14} />
              {loading ? "Checking..." : "Check Answer"}
            </button>
          </div>
        </div>
        {hintVisible && <div className="try-hint">💡 {task.hint}</div>}
      </div>

      <FeedbackPanel fb={feedback} />
    </div>
  );
}

export default function PlaygroundTab({ data, topic, onPractice }) {
  if (!data) return <p className="placeholder">Generate a topic first to explore practice tasks.</p>;

  return (
    <div className="playground-tab">
      <div className="pg-intro">
        <h3>🛠️ Practice Tasks</h3>
        <p>Write your answer, then click "Check Answer" for detailed AI feedback on your mistakes.</p>
      </div>
      {data.tasks?.map((task, i) => (
        <TaskCard key={i} task={task} index={i} topic={topic} onPractice={onPractice} />
      ))}
    </div>
  );
}
