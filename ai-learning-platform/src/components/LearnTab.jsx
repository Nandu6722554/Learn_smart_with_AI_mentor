import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlaygroundTab from "./PlaygroundTab";
import QuizTab from "./QuizTab";
import TutorActions from "./TutorActions";
import CodeBlock from "./CodeBlock";
import SelfCheck from "./SelfCheck";
import TryYourself from "./TryYourself";
import NextSteps from "./NextSteps";
import AutoPractice from "./AutoPractice";
import ShareButton from "./ShareButton";
import { highlight } from "../utils/highlight";

const STEPS = ["Intuition", "Core Concepts", "Subtopics", "Practice", "Quiz"];

export default function LearnTab({ data, playgroundData, quizData, onTopicSelect, onSectionChange, onPractice, topic, weakAreas }) {
  const [step, setStep] = useState(0);

  if (!data) return <p className="placeholder">Enter a topic and click Generate to start learning.</p>;

  const totalSteps = STEPS.length;

  const goNext = () => {
    const next = Math.min(step + 1, totalSteps - 1);
    console.log("Current Step:", next);
    setStep(next);
    onSectionChange?.(STEPS[next]);
  };

  const goPrev = () => {
    const prev = Math.max(step - 1, 0);
    console.log("Current Step:", prev);
    setStep(prev);
    onSectionChange?.(STEPS[prev]);
  };

  const goTo = (i) => {
    console.log("Current Step:", i);
    setStep(i);
    onSectionChange?.(STEPS[i]);
  };

  return (
    <div className="guided-learn">

      {/* Header */}
      <div className="learn-header">
        <h2>{data.title}</h2>
        <span className={`badge badge-${data.difficulty}`}>{data.difficulty}</span>
        <ShareButton topic={data.title} summary={data.summary} />
      </div>

      {/* Step Progress */}
      <div className="step-progress">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <div key={i} className="step-progress-item">
              <button
                className={`step-pill ${state}`}
                onClick={() => goTo(i)}
                title={s}
              >
                <span className="step-pill-num">
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="step-pill-label">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`step-connector ${i < step ? "done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {/* Step Content */}
      <div className="step-content">

        {/* Step 0: Intuition */}
        {step === 0 && (
          <div>
            <h3 className="step-title">💡 Intuition</h3>
            {data.intuitive_start && (
              <div className="info-card accent-yellow">
                <div className="info-card-label">Intuition</div>
                <p>{highlight(data.intuitive_start)}</p>
              </div>
            )}
            {data.why_this_matters && (
              <div className="info-card accent-purple">
                <div className="info-card-label">🎯 Why This Matters</div>
                <p>{highlight(data.why_this_matters)}</p>
              </div>
            )}
            {data.visual_explanation && (
              <div className="info-card accent-blue visual-card">
                <div className="info-card-label">🖼️ Visualize It</div>
                <div className="visual-imagine-label">
                  <span className="visual-eye">👁️</span> Imagine this:
                </div>
                <pre className="visual-block">{data.visual_explanation}</pre>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Core Concepts */}
        {step === 1 && (
          <div>
            <h3 className="step-title">🧠 Core Concepts</h3>
            {data.core_concepts?.length > 0
              ? data.core_concepts.map((c, i) => (
                <div key={i} className="concept-card">
                  <h4>{c.name}</h4>
                  <p className="example-text">💡 {highlight(c.intuitive_explanation)}</p>
                  <p style={{ marginTop: "0.5rem" }}>{highlight(c.technical_explanation)}</p>
                  {c.real_world_example && <p className="why" style={{ marginTop: "0.5rem" }}>🌍 {highlight(c.real_world_example)}</p>}
                  <TutorActions topic={data.title} concept={c.name} />
                </div>
              ))
              : <p className="placeholder">No core concepts available.</p>
            }
          </div>
        )}

        {/* Step 2: Subtopics */}
        {step === 2 && (
          <div>
            <h3 className="step-title">📚 Subtopics</h3>
            {data.subtopics?.length > 0
              ? data.subtopics.map((s, i) => (
                <div key={i} className="concept-card">
                  <h4>{s.name}</h4>
                  <p>{highlight(s.deep_explanation)}</p>
                  {s.step_by_step_working?.length > 0 && (
                    <div style={{ margin: "0.75rem 0" }}>
                      <strong style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Step-by-step:</strong>
                      <ol style={{ marginTop: "0.4rem" }}>
                        {s.step_by_step_working.map((step, j) => <li key={j}>{highlight(step)}</li>)}
                      </ol>
                    </div>
                  )}
                  {s.real_world_example && <p className="example-text" style={{ marginTop: "0.5rem" }}>🌍 {highlight(s.real_world_example)}</p>}
                  {s.code_example && <CodeBlock code={s.code_example} />}
                  {s.code_explanation && <p className="why" style={{ marginTop: "0.5rem" }}>📝 {s.code_explanation}</p>}
                  <TutorActions topic={data.title} concept={s.name} />
                  <TryYourself topic={data.title} subtopic={s.name} />
                </div>
              ))
              : <p className="placeholder">No subtopics available.</p>
            }
            {data.how_it_works_flow?.length > 0 && (
              <div className="concept-card">
                <h4>⚙️ How It All Works Together</h4>
                <ol>{data.how_it_works_flow.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Practice */}
        {step === 3 && (
          <div>
            <h3 className="step-title">🛠️ Practice</h3>
            <AutoPractice topic={topic || data.title} level={data.difficulty} onPractice={onPractice} />
          </div>
        )}

        {/* Step 4: Quiz */}
        {step === 4 && (
          <div>
            <h3 className="step-title">📝 Quiz</h3>
            {data.common_mistakes?.length > 0 && (
              <div className="concept-card" style={{ marginBottom: "1.25rem" }}>
                <h4>⚠️ Common Mistakes to Avoid</h4>
                <ul>{data.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
            )}
            {data.interview_ready_points?.length > 0 && (
              <div className="concept-card" style={{ marginBottom: "1.25rem" }}>
                <h4>🎯 Interview Ready Points</h4>
                <ul>{data.interview_ready_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
            <SelfCheck topic={data.title} level={data.difficulty} />
            <div style={{ marginTop: "1.5rem" }}>
              <QuizTab data={quizData} />
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <NextSteps topic={data.title} level={data.difficulty} weakAreas={weakAreas} onTopicSelect={onTopicSelect} />
            </div>
          </div>
        )}

      </div>

      {/* Navigation — outside step-content, always visible */}
      <div className="step-nav">
        <button
          className="nav-btn"
          onClick={() => { console.log("Prev clicked"); goPrev(); }}
          disabled={step === 0}
          type="button"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="step-counter">Step {step + 1} of {totalSteps}</span>
        <button
          className="nav-btn primary"
          onClick={() => { console.log("Next clicked"); goNext(); }}
          disabled={step === totalSteps - 1}
          type="button"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
