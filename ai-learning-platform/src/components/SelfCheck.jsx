import { useState } from "react";
import { fetchSelfCheck } from "../api";
import { CheckCircle, XCircle, Trophy, RotateCcw, Zap } from "lucide-react";

/* ── Self Check — proper interactive quiz, no pre-shown answers ── */
export default function SelfCheck({ topic, level, onXP }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showXP, setShowXP]       = useState(false);

  const load = async () => {
    setLoading(true);
    setSelected({}); setSubmitted(false); setShowXP(false);
    try {
      const r = await fetchSelfCheck(topic, level);
      setQuestions(r.data.questions);
    } finally { setLoading(false); }
  };

  const total     = questions?.length || 0;
  const answered  = Object.keys(selected).length;
  const allDone   = answered === total && total > 0;

  const score = submitted
    ? Object.keys(selected).filter(i => selected[i] === questions[i]?.answer).length
    : 0;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const xpEarned = Math.round((pct / 100) * 30) + 5; // 5–35 XP

  const handleSubmit = () => {
    setSubmitted(true);
    setShowXP(true);
    onXP?.(xpEarned, "Self Check");
    setTimeout(() => setShowXP(false), 3000);
  };

  const handleReset = () => {
    setSelected({}); setSubmitted(false); setShowXP(false);
    load();
  };

  return (
    <div className="sc-wrap">
      <div className="sc-header">
        <div>
          <h4 className="sc-title">🧪 Self Check</h4>
          <p className="sc-sub">Test your understanding — no peeking!</p>
        </div>
        {!questions && !loading && (
          <button className="sc-gen-btn" onClick={load}>Generate Quiz</button>
        )}
        {questions && !submitted && (
          <span className="sc-progress">{answered}/{total} answered</span>
        )}
      </div>

      {loading && (
        <div className="sc-loading"><div className="spinner" /><p>Preparing questions...</p></div>
      )}

      {/* XP popup */}
      {showXP && (
        <div className="sc-xp-popup">
          <Zap size={14} /> +{xpEarned} XP earned!
        </div>
      )}

      {questions && (
        <>
          <div className="sc-questions">
            {questions.map((q, i) => {
              const userAns  = selected[i];
              const correct  = q.answer;
              const isRight  = submitted && userAns === correct;
              const isWrong  = submitted && userAns && userAns !== correct;

              // Build options: use q.options if available, else build from answer
              const opts = q.options?.length
                ? q.options
                : [q.answer, ...(q.distractors || [])].sort(() => Math.random() - 0.5);

              return (
                <div key={i} className={`sc-card ${submitted ? (isRight ? "sc-correct" : isWrong ? "sc-wrong" : "") : ""}`}>
                  <p className="sc-q">
                    <span className="sc-q-num">Q{i + 1}.</span> {q.question}
                  </p>
                  <div className="sc-options">
                    {opts.map((opt, j) => {
                      let cls = "sc-opt";
                      if (submitted) {
                        if (opt === correct) cls += " sc-opt-correct";
                        else if (opt === userAns) cls += " sc-opt-wrong";
                      } else if (opt === userAns) {
                        cls += " sc-opt-selected";
                      }
                      return (
                        <button key={j} className={cls}
                          onClick={() => !submitted && setSelected(p => ({ ...p, [i]: opt }))}>
                          {submitted && opt === correct && <CheckCircle size={13} />}
                          {submitted && opt === userAns && opt !== correct && <XCircle size={13} />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="sc-explanation">
                      {isRight ? "✅ Correct! " : isWrong ? "❌ Not quite. " : ""}
                      {q.explanation || q.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted ? (
            <button className="sc-submit-btn" onClick={handleSubmit} disabled={!allDone}>
              {allDone ? "Submit Answers" : `Answer all (${answered}/${total})`}
            </button>
          ) : (
            <div className="sc-result">
              <div className="sc-result-score">
                {pct >= 80 ? <Trophy size={18} style={{ color: "#F59E0B" }} /> : <CheckCircle size={18} style={{ color: "#A78BFA" }} />}
                <span>{score}/{total} correct — {pct}%</span>
                {pct === 100 && <span className="sc-perfect">Perfect!</span>}
              </div>
              <button className="sc-retry-btn" onClick={handleReset}>
                <RotateCcw size={13} /> Try Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
