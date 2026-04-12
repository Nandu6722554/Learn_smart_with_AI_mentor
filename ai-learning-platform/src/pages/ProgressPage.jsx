import { useState, useEffect } from "react";
import { Trophy, Zap, BookOpen, Target, TrendingUp, Flame, Plus, X, Lightbulb } from "lucide-react";
import DailyGoals from "../components/DailyGoals";
import { ACHIEVEMENTS } from "../store/useAppStore";
import { getMemory, setGoals, buildMemoryContext } from "../lib/memory";
import { fetchNextSteps } from "../api";

function XPBar({ xp, xpProgress, userLevel, levelName, nextLevelXP }) {
  return (
    <div className="xp-bar-card">
      <div className="xp-bar-top">
        <div className="xp-level-badge">Lv.{userLevel}</div>
        <div><div className="xp-level-name">{levelName}</div><div className="xp-amount">{xp} XP total</div></div>
        <div className="xp-next">Next: {nextLevelXP[userLevel]} XP</div>
      </div>
      <div className="xp-track"><div className="xp-fill" style={{ width: `${xpProgress}%` }} /></div>
      <div className="xp-pct">{xpProgress}% to Level {userLevel + 1}</div>
    </div>
  );
}

function GoalsSection({ goals, onSave }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput]     = useState("");
  const [list, setList]       = useState(goals);

  const add = () => {
    if (!input.trim()) return;
    const updated = [...list, input.trim()];
    setList(updated);
    onSave(updated);
    setInput("");
  };

  const remove = (i) => {
    const updated = list.filter((_, idx) => idx !== i);
    setList(updated);
    onSave(updated);
  };

  return (
    <div className="goals-section">
      <div className="goals-header">
        <h3><Target size={16} /> My Learning Goals</h3>
        <button className="tutor-btn" onClick={() => setEditing(e => !e)}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      {list.length === 0 && !editing && (
        <p className="home-empty">No goals set yet. Add your learning goals to personalize your experience.</p>
      )}
      <div className="goals-list">
        {list.map((g, i) => (
          <div key={i} className="goal-chip">
            <span>{g}</span>
            {editing && <button onClick={() => remove(i)}><X size={12} /></button>}
          </div>
        ))}
      </div>
      {editing && (
        <div className="goals-add">
          <input
            className="auth-input"
            placeholder="e.g. Learn machine learning, Prepare for interviews..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{ fontSize: "0.88rem", padding: "0.5rem 0.75rem" }}
          />
          <button className="generate-btn" style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem" }} onClick={add}>
            <Plus size={14} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

function SuggestedTopics({ weakAreas, recentTopics, onTopicSelect }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading]         = useState(false);

  const lastTopic = recentTopics[0];

  const load = async () => {
    if (!lastTopic) return;
    setLoading(true);
    try {
      const r = await fetchNextSteps(lastTopic, "intermediate", weakAreas);
      setSuggestions(r.data.steps);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="progress-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <h3><Lightbulb size={16} /> Suggested Next Topics</h3>
        {!suggestions && lastTopic && (
          <button className="tutor-btn" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Get Suggestions"}
          </button>
        )}
      </div>
      {!lastTopic && <p className="home-empty">Learn a topic first to get personalized suggestions.</p>}
      {suggestions && (
        <div className="topic-chips">
          {suggestions.map((s, i) => (
            <button key={i} className="topic-chip" onClick={() => onTopicSelect?.(s.topic)}
              title={s.reason} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", borderRadius: "10px", padding: "0.5rem 0.85rem" }}>
              <span style={{ fontWeight: 600 }}>{s.topic}</span>
              <span style={{ fontSize: "0.72rem", color: "#475569" }}>{s.reason}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgressPage({
  recentTopics, xp, userLevel, levelName, xpProgress, nextLevelXP,
  quizHistory, weakAreas, practiceCount, streak, onTopicSelect,
  dailyGoals, dailyGoalCount, unlockedAchievements, avgQuizScore,
}) {
  const [mem, setMem] = useState(getMemory());

  // Merge in-memory state with persisted memory
  const allTopics = [...new Set([...recentTopics, ...(mem.topicsLearned?.map(t => t.topic) || [])])];
  const allWeak   = [...new Set([...weakAreas, ...(mem.weakAreas || [])])];
  const totalXP   = Math.max(xp, mem.xp || 0);

  const handleGoalSave = (goals) => {
    setGoals(goals);
    setMem(m => ({ ...m, goals }));
  };

  return (
    <div className="progress-page">
      <div className="page-heading">
        <h2>📊 My Progress</h2>
        <p>Your personalized learning dashboard</p>
      </div>

      {/* Goals */}
      <GoalsSection goals={mem.goals || []} onSave={handleGoalSave} />

      {/* Daily Goals */}
      <DailyGoals dailyGoals={dailyGoals} streak={streak} dailyGoalCount={dailyGoalCount} />

      {/* XP Bar */}
      <XPBar xp={totalXP} xpProgress={xpProgress} userLevel={userLevel} levelName={levelName} nextLevelXP={nextLevelXP} />

      {/* Stats */}
      <div className="progress-stats-grid">
        <div className="stat-card-item" style={{ borderColor: "#f59e0b" }}>
          <div className="stat-card-icon" style={{ color: "#f59e0b" }}><Flame size={20} /></div>
          <div className="stat-card-value">{streak}</div>
          <div className="stat-card-label">Day Streak</div>
        </div>
        <div className="stat-card-item" style={{ borderColor: "#a78bfa" }}>
          <div className="stat-card-icon" style={{ color: "#a78bfa" }}><BookOpen size={20} /></div>
          <div className="stat-card-value">{allTopics.length}</div>
          <div className="stat-card-label">Topics Learned</div>
        </div>
        <div className="stat-card-item" style={{ borderColor: "#10b981" }}>
          <div className="stat-card-icon" style={{ color: "#10b981" }}><Target size={20} /></div>
          <div className="stat-card-value">{avgQuizScore}%</div>
          <div className="stat-card-label">Avg Quiz Score</div>
        </div>
        <div className="stat-card-item" style={{ borderColor: "#38bdf8" }}>
          <div className="stat-card-icon" style={{ color: "#38bdf8" }}><TrendingUp size={20} /></div>
          <div className="stat-card-value">{practiceCount}</div>
          <div className="stat-card-label">Practice Tasks</div>
        </div>
      </div>

      {/* Suggested next topics */}
      <SuggestedTopics weakAreas={allWeak} recentTopics={allTopics} onTopicSelect={onTopicSelect} />

      {/* Achievements */}
      <div className="achievements-section">
        <h3><Trophy size={16} /> Achievements</h3>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map(a => {
            const done = (unlockedAchievements || []).includes(a.id);
            return (
              <div key={a.id} className={`achievement-card ${done ? "unlocked" : "locked"}`}>
                <span className="achievement-icon">{a.icon}</span>
                <div className="achievement-info">
                  <div className="achievement-label">{a.label}</div>
                  <div className="achievement-desc">{a.desc}</div>
                </div>
                {done && <span className="achievement-done">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak areas */}
      {allWeak.length > 0 && (
        <div className="progress-section">
          <h3>⚠️ Areas to Revisit</h3>
          <div className="topic-chips">
            {allWeak.map((w, i) => (
              <button key={i} className="topic-chip" style={{ borderColor: "#ef4444", color: "#fca5a5" }}
                onClick={() => onTopicSelect?.(w)}>{w}</button>
            ))}
          </div>
        </div>
      )}

      {/* Topics learned */}
      {allTopics.length > 0 && (
        <div className="progress-section">
          <h3><BookOpen size={16} /> Topics Explored ({allTopics.length})</h3>
          <div className="topic-chips">
            {allTopics.map((t, i) => (
              <button key={i} className="topic-chip recent" onClick={() => onTopicSelect?.(t)}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz history */}
      {quizHistory.length > 0 && (
        <div className="progress-section">
          <h3><Trophy size={16} /> Quiz History</h3>
          <div className="quiz-history-list">
            {quizHistory.slice(0, 10).map((q, i) => (
              <div key={i} className="quiz-history-item">
                <div className="qh-topic">{q.topic}</div>
                <div className="qh-score" style={{ color: q.pct >= 80 ? "#10b981" : q.pct >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {q.score}/{q.total} ({q.pct}%)
                </div>
                <div className="qh-date">{q.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allTopics.length === 0 && (
        <div className="page-empty">
          <div className="page-empty-icon">🚀</div>
          <h3>Start your journey</h3>
          <p>Generate your first learning module to start tracking progress.</p>
        </div>
      )}
    </div>
  );
}
