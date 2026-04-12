import { useState } from "react";
import { CheckCircle, XCircle, Trophy, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

function ScoreRing({ score, total }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="score-ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="38" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="45" cy="45" r="38" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 38}`}
          strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="score-ring-text" style={{ color }}>
        <span className="score-big">{score}/{total}</span>
        <span className="score-pct">{pct}%</span>
      </div>
    </div>
  );
}

function FeedbackCard({ icon, title, items, color, bg }) {
  if (!items?.length) return null;
  return (
    <div className="feedback-card" style={{ borderColor: color, background: bg }}>
      <div className="feedback-card-title" style={{ color }}>
        {icon} {title}
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={i} style={{ color: "#cbd5e1" }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function QuizTab({ data, onQuizComplete, topic }) {
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!data) return <p className="placeholder">Generate a topic first to get quiz questions.</p>;

  const total = data.questions?.length || 0;
  const score = Object.keys(revealed).filter(
    (qi) => selected[qi] === data.questions[qi]?.correct_answer
  ).length;
  const allAnswered = Object.keys(selected).length === total;
  const pct = total ? Math.round((score / total) * 100) : 0;

  const handleSelect = (qi, opt) => {
    if (revealed[qi]) return;
    setSelected((p) => ({ ...p, [qi]: opt }));
  };

  const handleSubmit = () => {
    const all = {};
    data.questions.forEach((_, i) => { all[i] = true; });
    setRevealed(all);
    setSubmitted(true);
    // report to parent for XP + progress tracking
    const finalScore = Object.keys(all).filter(qi => selected[qi] === data.questions[qi]?.correct_answer).length;
    onQuizComplete?.(topic, finalScore, total, weakAreas);
  };

  const handleReset = () => {
    setSelected({}); setRevealed({}); setSubmitted(false);
  };

  // derive dynamic feedback if API didn't return enough
  const strengths = data.feedback?.strengths?.length
    ? data.feedback.strengths
    : score === total ? ["Perfect score! You have a strong grasp of this topic."]
    : pct >= 60 ? ["Good understanding of core concepts."] : [];

  const weakAreas = data.feedback?.weak_areas?.length
    ? data.feedback.weak_areas
    : pct < 60 ? ["Review the fundamental concepts and try again."] : [];

  const suggestions = data.feedback?.improvement_suggestions?.length
    ? data.feedback.improvement_suggestions
    : pct < 100 ? ["Re-read the subtopics for questions you got wrong.", "Use 'Explain Simpler' on concepts you found tricky."] : ["Try the advanced level for a bigger challenge!"];

  return (
    <div className="quiz-tab">

      {/* Questions */}
      {data.questions?.map((q, qi) => (
        <div key={qi} className="quiz-card">
          <p className="quiz-q">
            <span className="q-num">Q{qi + 1}.</span> {q.question}
          </p>
          <div className="options">
            {q.options.map((opt, oi) => {
              const isSelected = selected[qi] === opt;
              const isCorrect = opt === q.correct_answer;
              let cls = "option";
              if (revealed[qi]) {
                if (isCorrect) cls += " correct";
                else if (isSelected) cls += " wrong";
              } else if (isSelected) cls += " selected";
              return (
                <button key={oi} className={cls} onClick={() => handleSelect(qi, opt)}>
                  {revealed[qi] && isCorrect && <CheckCircle size={14} style={{ flexShrink: 0 }} />}
                  {revealed[qi] && isSelected && !isCorrect && <XCircle size={14} style={{ flexShrink: 0 }} />}
                  {opt}
                </button>
              );
            })}
          </div>
          {revealed[qi] && (
            <div className="explanation">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}

      {/* Submit / Reset */}
      {!submitted ? (
        <button
          className="generate-btn"
          style={{ width: "100%", padding: "0.65rem", marginTop: "0.5rem" }}
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          {allAnswered ? "Submit Quiz" : `Answer all questions (${Object.keys(selected).length}/${total})`}
        </button>
      ) : (
        <button
          className="nav-btn"
          style={{ marginTop: "0.5rem" }}
          onClick={handleReset}
        >
          🔄 Retake Quiz
        </button>
      )}

      {/* Feedback Panel */}
      {submitted && (
        <div className="feedback-panel">
          <div className="feedback-score-row">
            <ScoreRing score={score} total={total} />
            <div className="feedback-score-text">
              <div className="feedback-title">
                {pct === 100 ? <><Trophy size={20} /> Perfect Score!</>
                  : pct >= 80 ? <><TrendingUp size={20} /> Great Job!</>
                  : pct >= 50 ? <><AlertTriangle size={20} /> Keep Practicing</>
                  : <><XCircle size={20} /> Needs Review</>}
              </div>
              <p className="feedback-subtitle">
                You answered {score} out of {total} questions correctly.
              </p>
            </div>
          </div>

          <div className="feedback-cards">
            <FeedbackCard
              icon={<CheckCircle size={15} />}
              title="Strengths"
              items={strengths}
              color="#10b981"
              bg="#052e16"
            />
            <FeedbackCard
              icon={<XCircle size={15} />}
              title="Weak Areas"
              items={weakAreas}
              color="#ef4444"
              bg="#450a0a"
            />
            <FeedbackCard
              icon={<Lightbulb size={15} />}
              title="Suggestions"
              items={suggestions}
              color="#f59e0b"
              bg="#1a1500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
