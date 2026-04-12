import { useState } from "react";

export default function QuizTab({ data }) {
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});

  if (!data) return <p className="placeholder">Generate a topic first to get quiz questions.</p>;

  const handleSelect = (qi, opt) => {
    if (revealed[qi]) return;
    setSelected((p) => ({ ...p, [qi]: opt }));
  };

  const handleReveal = (qi) => setRevealed((p) => ({ ...p, [qi]: true }));

  return (
    <div className="quiz-tab">
      {data.questions?.map((q, qi) => (
        <div key={qi} className="quiz-card">
          <p className="quiz-q"><span className="q-num">Q{qi + 1}.</span> {q.question}</p>
          <div className="options">
            {q.options.map((opt, oi) => {
              const isSelected = selected[qi] === opt;
              const isCorrect = opt === q.correct_answer;
              let cls = "option";
              if (revealed[qi]) {
                if (isCorrect) cls += " correct";
                else if (isSelected) cls += " wrong";
              } else if (isSelected) {
                cls += " selected";
              }
              return (
                <button key={oi} className={cls} onClick={() => handleSelect(qi, opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected[qi] && !revealed[qi] && (
            <button className="reveal-btn" onClick={() => handleReveal(qi)}>Check Answer</button>
          )}
          {revealed[qi] && (
            <div className="explanation">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
