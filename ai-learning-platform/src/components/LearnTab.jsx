import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Lightbulb, Brain, BookOpen, Wrench, ClipboardList } from "lucide-react";
import { saveSession } from "../lib/session";
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

const STEPS = [
  { label: "Intuition",     icon: Lightbulb,     color: "#F59E0B" },
  { label: "Core Concepts", icon: Brain,          color: "#A78BFA" },
  { label: "Subtopics",     icon: BookOpen,       color: "#22D3EE" },
  { label: "Practice",      icon: Wrench,         color: "#10B981" },
  { label: "Quiz",          icon: ClipboardList,  color: "#F97316" },
];

const DIFF_CONFIG = {
  basic:        { label: "Basic",        color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  intermediate: { label: "Intermediate", color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  advanced:     { label: "Advanced",     color: "#A78BFA", bg: "rgba(139,92,246,0.14)"  },
};

export default function LearnTab({ data, playgroundData, quizData, onTopicSelect, onSectionChange, onPractice, topic, weakAreas }) {
  const [step, setStep] = useState(0);

  if (!data) return (
    <div className="page-empty">
      <div className="page-empty-icon">📚</div>
      <h3>Nothing here yet</h3>
      <p>Enter a topic and click Generate to start learning.</p>
    </div>
  );

  const totalSteps = STEPS.length;
  const pct = Math.round((step / (totalSteps - 1)) * 100);
  const diff = DIFF_CONFIG[data.difficulty] || DIFF_CONFIG.basic;

  const goTo = (i) => {
    setStep(i);
    onSectionChange?.(STEPS[i].label);
    saveSession({ topic: data?.title, mode: "learn", step: STEPS[i].label, page: "learn", level: data?.difficulty });
  };
  const goNext = () => goTo(Math.min(step + 1, totalSteps - 1));
  const goPrev = () => goTo(Math.max(step - 1, 0));

  const StepIcon = STEPS[step].icon;

  return (
    <div className="lv-wrap">

      {/* ── Course Header ─────────────────────────────── */}
      <div className="lv-header">
        <div className="lv-header-left">
          <div className="lv-topic-badge">
            <span className="lv-topic-icon">📚</span>
            <span className="lv-topic-label">Learning Module</span>
          </div>
          <h2 className="lv-title">{data.title}</h2>
          {data.summary && <p className="lv-summary">{data.summary}</p>}
          <div className="lv-meta">
            <span className="lv-diff-badge" style={{ color: diff.color, background: diff.bg }}>
              {diff.label}
            </span>
            <span className="lv-meta-sep">·</span>
            <span className="lv-meta-text">{totalSteps} steps</span>
            <span className="lv-meta-sep">·</span>
            <span className="lv-meta-text" style={{ color: "#A78BFA" }}>{pct}% complete</span>
          </div>
        </div>
        <ShareButton topic={data.title} summary={data.summary} />
      </div>

      {/* ── Step Progress Bar ──────────────────────────── */}
      <div className="lv-progress-section">
        <div className="lv-steps">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "pending";
            const Icon = s.icon;
            return (
              <div key={i} className="lv-step-item">
                <button className={`lv-step-btn lv-step-${state}`} onClick={() => goTo(i)}
                  style={state === "active" ? { borderColor: s.color, boxShadow: `0 0 0 3px ${s.color}25` } : {}}>
                  <span className="lv-step-num" style={state !== "pending" ? { background: state === "done" ? "#10B981" : s.color } : {}}>
                    {state === "done" ? <CheckCircle size={11} /> : <Icon size={11} />}
                  </span>
                  <span className="lv-step-label" style={state === "active" ? { color: s.color } : {}}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="lv-step-line" style={{ background: i < step ? "#8B5CF6" : "#1e2640" }} />
                )}
              </div>
            );
          })}
        </div>
        <div className="lv-progress-bar">
          <div className="lv-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* ── Step Content ───────────────────────────────── */}
      <div className="lv-content">

        {/* Step indicator pill */}
        <div className="lv-step-indicator" style={{ color: STEPS[step].color, borderColor: `${STEPS[step].color}30`, background: `${STEPS[step].color}10` }}>
          <StepIcon size={14} />
          <span>Step {step + 1} — {STEPS[step].label}</span>
        </div>

        {/* ── Step 0: Intuition ── */}
        {step === 0 && (
          <div className="lv-step-body">
            <h3 className="lv-step-title">💡 Build Your Intuition</h3>
            <p className="lv-step-desc">Before diving into details, let's build a mental model of what this is about.</p>

            {data.intuitive_start && (
              <div className="lv-info-block lv-block-yellow">
                <div className="lv-block-label">🧠 The Big Idea</div>
                <p>{highlight(data.intuitive_start)}</p>
              </div>
            )}
            {data.why_this_matters && (
              <div className="lv-info-block lv-block-purple">
                <div className="lv-block-label">🎯 Why This Matters</div>
                <p>{highlight(data.why_this_matters)}</p>
              </div>
            )}
            {data.visual_explanation && (
              <div className="lv-info-block lv-block-cyan">
                <div className="lv-block-label">🖼️ Visualize It</div>
                <pre className="lv-visual-pre">{data.visual_explanation}</pre>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Core Concepts ── */}
        {step === 1 && (
          <div className="lv-step-body">
            <h3 className="lv-step-title">🧠 Core Concepts</h3>
            <p className="lv-step-desc">The fundamental building blocks you need to understand.</p>
            {data.core_concepts?.length > 0
              ? data.core_concepts.map((c, i) => (
                <div key={i} className="lv-concept-card">
                  <div className="lv-concept-header">
                    <div className="lv-concept-num">{i + 1}</div>
                    <h4 className="lv-concept-name">{c.name}</h4>
                  </div>
                  <div className="lv-concept-body">
                    {c.intuitive_explanation && (
                      <div className="lv-concept-row lv-row-intuition">
                        <span className="lv-row-icon">💡</span>
                        <p>{highlight(c.intuitive_explanation)}</p>
                      </div>
                    )}
                    {c.technical_explanation && (
                      <div className="lv-concept-row lv-row-technical">
                        <span className="lv-row-icon">⚙️</span>
                        <p>{highlight(c.technical_explanation)}</p>
                      </div>
                    )}
                    {c.real_world_example && (
                      <div className="lv-concept-row lv-row-example">
                        <span className="lv-row-icon">🌍</span>
                        <p>{highlight(c.real_world_example)}</p>
                      </div>
                    )}
                  </div>
                  <TutorActions topic={data.title} concept={c.name} />
                </div>
              ))
              : <p className="placeholder">No core concepts available.</p>
            }
          </div>
        )}

        {/* ── Step 2: Subtopics ── */}
        {step === 2 && (
          <div className="lv-step-body">
            <h3 className="lv-step-title">📚 Deep Dive</h3>
            <p className="lv-step-desc">Explore each subtopic in detail with examples and code.</p>
            {data.subtopics?.length > 0
              ? data.subtopics.map((s, i) => (
                <div key={i} className="lv-concept-card">
                  <div className="lv-concept-header">
                    <div className="lv-concept-num" style={{ background: "rgba(34,211,238,0.15)", color: "#22D3EE" }}>{i + 1}</div>
                    <h4 className="lv-concept-name">{s.name}</h4>
                  </div>
                  <div className="lv-concept-body">
                    {s.deep_explanation && <p className="lv-subtopic-exp">{highlight(s.deep_explanation)}</p>}
                    {s.step_by_step_working?.length > 0 && (
                      <div className="lv-steps-list">
                        <div className="lv-steps-label">Step-by-step:</div>
                        <ol className="lv-ordered-list">
                          {s.step_by_step_working.map((st, j) => <li key={j}>{highlight(st)}</li>)}
                        </ol>
                      </div>
                    )}
                    {s.real_world_example && (
                      <div className="lv-concept-row lv-row-example">
                        <span className="lv-row-icon">🌍</span>
                        <p>{highlight(s.real_world_example)}</p>
                      </div>
                    )}
                    {s.code_example && <CodeBlock code={s.code_example} />}
                    {s.code_explanation && (
                      <div className="lv-concept-row lv-row-code-exp">
                        <span className="lv-row-icon">📝</span>
                        <p>{s.code_explanation}</p>
                      </div>
                    )}
                  </div>
                  <TutorActions topic={data.title} concept={s.name} />
                  <TryYourself topic={data.title} subtopic={s.name} />
                </div>
              ))
              : <p className="placeholder">No subtopics available.</p>
            }
            {data.how_it_works_flow?.length > 0 && (
              <div className="lv-concept-card lv-flow-card">
                <div className="lv-concept-header">
                  <div className="lv-concept-num" style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}>⚙️</div>
                  <h4 className="lv-concept-name">How It All Works Together</h4>
                </div>
                <ol className="lv-ordered-list" style={{ padding: "0 1rem 0.5rem" }}>
                  {data.how_it_works_flow.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Practice ── */}
        {step === 3 && (
          <div className="lv-step-body">
            <h3 className="lv-step-title">🛠️ Practice</h3>
            <p className="lv-step-desc">Apply what you've learned with hands-on exercises.</p>
            <AutoPractice topic={topic || data.title} level={data.difficulty} onPractice={onPractice} />
          </div>
        )}

        {/* ── Step 4: Quiz ── */}
        {step === 4 && (
          <div className="lv-step-body">
            <h3 className="lv-step-title">📝 Test Your Knowledge</h3>
            <p className="lv-step-desc">Check your understanding and identify areas to revisit.</p>

            {data.common_mistakes?.length > 0 && (
              <div className="lv-concept-card lv-mistakes-card">
                <div className="lv-concept-header">
                  <div className="lv-concept-num" style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>⚠️</div>
                  <h4 className="lv-concept-name">Common Mistakes to Avoid</h4>
                </div>
                <ul className="lv-bullet-list" style={{ padding: "0 1rem 0.5rem" }}>
                  {data.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
            {data.interview_ready_points?.length > 0 && (
              <div className="lv-concept-card lv-interview-card">
                <div className="lv-concept-header">
                  <div className="lv-concept-num" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>🎯</div>
                  <h4 className="lv-concept-name">Interview Ready Points</h4>
                </div>
                <ul className="lv-bullet-list" style={{ padding: "0 1rem 0.5rem" }}>
                  {data.interview_ready_points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            <SelfCheck topic={data.title} level={data.difficulty} onXP={(amt, label) => {}} />
            <div className="lv-quiz-section">
              <QuizTab data={quizData} />
            </div>
            <NextSteps topic={data.title} level={data.difficulty} weakAreas={weakAreas} onTopicSelect={onTopicSelect} />
          </div>
        )}

      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <div className="lv-nav">
        <button className="lv-nav-btn lv-nav-prev" onClick={goPrev} disabled={step === 0}>
          <ChevronLeft size={16} /> Previous
        </button>
        <div className="lv-nav-dots">
          {STEPS.map((_, i) => (
            <button key={i} className={`lv-nav-dot ${i === step ? "active" : i < step ? "done" : ""}`}
              onClick={() => goTo(i)} />
          ))}
        </div>
        <button className="lv-nav-btn lv-nav-next" onClick={goNext} disabled={step === totalSteps - 1}>
          {step === totalSteps - 2 ? "Take Quiz" : "Next"} <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
