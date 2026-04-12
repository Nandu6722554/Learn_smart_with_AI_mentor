import { Zap, BookOpen, Brain, Trophy, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: <Brain size={24} />, title: "AI-Powered Explanations", desc: "Get deep, structured explanations adapted to your level — basic, intermediate, or advanced." },
  { icon: <BookOpen size={24} />, title: "Guided Learning Steps", desc: "Learn through Intuition → Concepts → Subtopics → Practice → Quiz in a structured flow." },
  { icon: <Zap size={24} />, title: "Interactive Tutor Chat", desc: "Ask your AI tutor anything, anytime. Context-aware answers based on what you're learning." },
  { icon: <Trophy size={24} />, title: "Progress & Gamification", desc: "Earn XP, track streaks, and level up as you learn more topics and ace quizzes." },
];

export default function Landing({ onGetStarted }) {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">🎓 Mentor<span className="logo-ai">AI</span></div>
        <button className="landing-login-btn" onClick={onGetStarted}>Sign In</button>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">✨ AI-Powered Learning</div>
        <h1>Learn Anything with Your<br /><span className="landing-gradient">Personal AI Mentor</span></h1>
        <p>Type any topic. Get a complete learning module — explanations, examples, practice tasks, and quizzes — all powered by AI.</p>
        <div className="landing-hero-btns">
          <button className="generate-btn landing-cta" onClick={onGetStarted}>
            <Zap size={18} /> Start Learning Free <ArrowRight size={16} />
          </button>
        </div>
        <div className="landing-hero-preview">
          <div className="preview-card">
            <div className="preview-label">Try asking:</div>
            {["Recursion", "Neural Networks", "SQL Joins", "DBSCAN", "React Hooks"].map((t, i) => (
              <span key={i} className="topic-chip">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2>Everything you need to learn effectively</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <h2>How it works</h2>
        <div className="how-steps">
          {[
            { n: "01", t: "Enter a topic", d: "Type any subject you want to learn" },
            { n: "02", t: "Choose your level", d: "Basic, intermediate, or advanced" },
            { n: "03", t: "Learn step by step", d: "Follow the guided 5-step learning flow" },
            { n: "04", t: "Practice & Quiz", d: "Test yourself and get AI feedback" },
          ].map((s, i) => (
            <div key={i} className="how-step">
              <div className="how-num">{s.n}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section">
        <h2>Ready to start learning?</h2>
        <p>Join thousands of learners using AI to master new skills.</p>
        <button className="generate-btn landing-cta" onClick={onGetStarted}>
          <Zap size={18} /> Get Started Free
        </button>
      </section>

      <footer className="landing-footer">
        <p>🎓 MentorAI — Your Personal AI Learning Mentor</p>
        <p style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "#1e293b" }}>© 2026 MentorAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
