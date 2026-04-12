import { useState } from "react";
import { ArrowRight, BookOpen, Briefcase, Brain, Code, Database, Zap, CheckCircle } from "lucide-react";

const GOALS = [
  { id: "dsa",      icon: <Code size={20} />,      label: "Data Structures & Algorithms", color: "#A78BFA" },
  { id: "ml",       icon: <Brain size={20} />,      label: "Machine Learning / AI",        color: "#22D3EE" },
  { id: "web",      icon: <BookOpen size={20} />,   label: "Web Development",              color: "#10B981" },
  { id: "interview",icon: <Briefcase size={20} />,  label: "Interview Preparation",        color: "#F59E0B" },
  { id: "data",     icon: <Database size={20} />,   label: "Data Science / SQL",           color: "#8B5CF6" },
  { id: "other",    icon: <Zap size={20} />,        label: "Something else",               color: "#F97316" },
];

const LEVELS = [
  { id: "beginner",     label: "Beginner",     desc: "Just starting out",          emoji: "🌱" },
  { id: "intermediate", label: "Intermediate", desc: "Know the basics",            emoji: "⚡" },
  { id: "advanced",     label: "Advanced",     desc: "Looking to go deeper",       emoji: "🔥" },
];

const ONBOARDING_KEY = "mentorai_onboarded";

export function hasOnboarded() {
  return !!localStorage.getItem(ONBOARDING_KEY);
}

export function markOnboarded() {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export default function Onboarding({ onComplete, userName }) {
  const [step, setStep]     = useState(0); // 0=welcome, 1=goal, 2=level, 3=done
  const [goal, setGoal]     = useState(null);
  const [level, setLevel]   = useState(null);

  const name = userName || "there";

  const finish = () => {
    markOnboarded();
    onComplete({ goal, level });
  };

  return (
    <div className="ob-overlay">
      <div className="ob-card">

        {/* Progress dots */}
        <div className="ob-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`ob-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="ob-step">
            <div className="ob-icon-wrap">
              <span className="ob-icon-emoji">🎓</span>
            </div>
            <h2 className="ob-title">Welcome to MentorAI{name !== "there" ? `, ${name}` : ""}!</h2>
            <p className="ob-sub">
              Your personal AI learning mentor. We'll help you learn anything — from algorithms to machine learning — step by step.
            </p>
            <div className="ob-welcome-features">
              {[
                { icon: "⚡", text: "AI-powered explanations" },
                { icon: "📚", text: "Guided 5-step learning" },
                { icon: "🏆", text: "XP, streaks & badges" },
                { icon: "📅", text: "30-day learning plans" },
              ].map((f, i) => (
                <div key={i} className="ob-feature-row">
                  <span className="ob-feature-icon">{f.icon}</span>
                  <span className="ob-feature-text">{f.text}</span>
                </div>
              ))}
            </div>
            <button className="ob-next-btn" onClick={() => setStep(1)}>
              Let's get started <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 1: Goal ── */}
        {step === 1 && (
          <div className="ob-step">
            <h2 className="ob-title">What do you want to learn?</h2>
            <p className="ob-sub">We'll personalise your experience based on your goal.</p>
            <div className="ob-goals-grid">
              {GOALS.map(g => (
                <button key={g.id}
                  className={`ob-goal-card ${goal === g.id ? "selected" : ""}`}
                  onClick={() => setGoal(g.id)}
                  style={goal === g.id ? { borderColor: g.color, background: `${g.color}12` } : {}}>
                  <span className="ob-goal-icon" style={{ color: g.color, background: `${g.color}15` }}>{g.icon}</span>
                  <span className="ob-goal-label">{g.label}</span>
                  {goal === g.id && <CheckCircle size={14} className="ob-goal-check" style={{ color: g.color }} />}
                </button>
              ))}
            </div>
            <div className="ob-step-actions">
              <button className="ob-back-btn" onClick={() => setStep(0)}>Back</button>
              <button className="ob-next-btn" onClick={() => setStep(2)} disabled={!goal}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Level ── */}
        {step === 2 && (
          <div className="ob-step">
            <h2 className="ob-title">What's your current level?</h2>
            <p className="ob-sub">We'll adjust the difficulty and explanations to match.</p>
            <div className="ob-levels">
              {LEVELS.map(l => (
                <button key={l.id}
                  className={`ob-level-card ${level === l.id ? "selected" : ""}`}
                  onClick={() => setLevel(l.id)}>
                  <span className="ob-level-emoji">{l.emoji}</span>
                  <div className="ob-level-info">
                    <div className="ob-level-name">{l.label}</div>
                    <div className="ob-level-desc">{l.desc}</div>
                  </div>
                  {level === l.id && <CheckCircle size={16} style={{ color: "#A78BFA", flexShrink: 0 }} />}
                </button>
              ))}
            </div>
            <div className="ob-step-actions">
              <button className="ob-back-btn" onClick={() => setStep(1)}>Back</button>
              <button className="ob-next-btn" onClick={() => setStep(3)} disabled={!level}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Ready ── */}
        {step === 3 && (
          <div className="ob-step ob-step-final">
            <div className="ob-ready-icon">🚀</div>
            <h2 className="ob-title">You're all set!</h2>
            <p className="ob-sub">
              Your learning journey starts now. We've personalised MentorAI based on your goals.
            </p>
            <div className="ob-summary">
              <div className="ob-summary-row">
                <span className="ob-summary-label">Goal</span>
                <span className="ob-summary-val">{GOALS.find(g => g.id === goal)?.label}</span>
              </div>
              <div className="ob-summary-row">
                <span className="ob-summary-label">Level</span>
                <span className="ob-summary-val" style={{ textTransform: "capitalize" }}>{level}</span>
              </div>
            </div>
            <button className="ob-next-btn ob-finish-btn" onClick={finish}>
              <Zap size={16} /> Start Learning
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
