import { useState } from "react";
import { Trophy, Zap, BookOpen, Target, TrendingUp, Flame, Plus, X, Lightbulb, Star, CheckCircle, AlertCircle } from "lucide-react";
import DailyGoals from "../components/DailyGoals";
import { ACHIEVEMENTS } from "../store/useAppStore";
import { getMemory, setGoals } from "../lib/memory";
import { fetchNextSteps } from "../api";

/* ── Stat Card ─────────────────────────────────────────── */
function StatCard({ icon, value, label, color, sub, progress, progressPct }) {
  return (
    <div className="pg-stat-card" style={{ "--sc": color }}>
      <div className="pg-stat-top">
        <div className="pg-stat-icon" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <div className="pg-stat-body">
          <div className="pg-stat-value" style={{ color }}>{value}</div>
          <div className="pg-stat-label">{label}</div>
          {sub && <div className="pg-stat-sub">{sub}</div>}
        </div>
      </div>
      {progress !== undefined && (
        <div className="pg-stat-bar">
          <div className="pg-stat-bar-fill" style={{ width: `${progressPct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

/* ── Goals Section ─────────────────────────────────────── */
function GoalsSection({ goals, onSave }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput]     = useState("");
  const [list, setList]       = useState(goals);

  const add = () => {
    if (!input.trim()) return;
    const updated = [...list, input.trim()];
    setList(updated); onSave(updated); setInput("");
  };
  const remove = (i) => {
    const updated = list.filter((_, idx) => idx !== i);
    setList(updated); onSave(updated);
  };

  return (
    <div className="pg-card">
      <div className="pg-card-header">
        <div className="pg-card-title-row">
          <Target size={16} style={{ color: "#A78BFA" }} />
          <h3>My Learning Goals</h3>
        </div>
        <button className="pg-edit-btn" onClick={() => setEditing(e => !e)}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      {list.length === 0 && !editing && (
        <p className="pg-empty-text">No goals yet. Add goals to personalize your experience.</p>
      )}
      <div className="pg-goals-list">
        {list.map((g, i) => (
          <div key={i} className="pg-goal-chip">
            <span>{g}</span>
            {editing && (
              <button className="pg-goal-remove" onClick={() => remove(i)}><X size={11} /></button>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="pg-goals-add">
          <input className="pg-input" placeholder="e.g. Learn machine learning, Prepare for interviews..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()} />
          <button className="pg-add-btn" onClick={add}><Plus size={14} /> Add</button>
        </div>
      )}
    </div>
  );
}

/* ── Suggested Topics ──────────────────────────────────── */
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
    } finally { setLoading(false); }
  };

  return (
    <div className="pg-card">
      <div className="pg-card-header">
        <div className="pg-card-title-row">
          <Lightbulb size={16} style={{ color: "#F59E0B" }} />
          <h3>Suggested Next Topics</h3>
        </div>
        {!suggestions && lastTopic && (
          <button className="pg-edit-btn" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Get Suggestions"}
          </button>
        )}
      </div>
      {!lastTopic && <p className="pg-empty-text">Learn a topic first to get personalized suggestions.</p>}
      {suggestions && (
        <div className="pg-suggestion-chips">
          {suggestions.map((s, i) => (
            <button key={i} className="pg-suggestion-chip" onClick={() => onTopicSelect?.(s.topic)} title={s.reason}>
              <span className="pg-suggestion-topic">{s.topic}</span>
              <span className="pg-suggestion-reason">{s.reason}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════ */
export default function ProgressPage({
  recentTopics, xp, userLevel, levelName, xpProgress, nextLevelXP,
  quizHistory, weakAreas, practiceCount, streak, onTopicSelect,
  dailyGoals, dailyGoalCount, unlockedAchievements, avgQuizScore,
}) {
  const [mem, setMem] = useState(getMemory());
  const allTopics = [...new Set([...recentTopics, ...(mem.topicsLearned?.map(t => t.topic) || [])])];
  const allWeak   = [...new Set([...weakAreas, ...(mem.weakAreas || [])])];
  const totalXP   = Math.max(xp, mem.xp || 0);

  const handleGoalSave = (goals) => { setGoals(goals); setMem(m => ({ ...m, goals })); };

  return (
    <div className="pg-page">

      {/* ── Page header ──────────────────────────────── */}
      <div className="pg-page-header">
        <div>
          <h2 className="pg-page-title">My Progress</h2>
          <p className="pg-page-sub">Your personalized learning dashboard</p>
        </div>
      </div>

      {/* ── Stat grid ────────────────────────────────── */}
      <div className="pg-stat-grid">
        <StatCard icon={<Flame size={20} />}    value={streak}           label="Day Streak"     color="#F59E0B" sub="Keep it going!" />
        <StatCard icon={<Zap size={20} />}      value={`${totalXP} XP`} label="Total XP"       color="#A78BFA" sub={`Level ${userLevel}`} />
        <StatCard icon={<BookOpen size={20} />} value={allTopics.length} label="Topics Learned" color="#22D3EE" sub="Explore more" />
        <StatCard icon={<Target size={20} />}   value={`${avgQuizScore}%`} label="Avg Quiz Score" color="#10B981"
          progress sub={avgQuizScore >= 80 ? "Excellent!" : avgQuizScore >= 50 ? "Good progress" : "Keep practicing"}
          progressPct={avgQuizScore} />
        <StatCard icon={<TrendingUp size={20} />} value={practiceCount} label="Practice Tasks" color="#F97316" sub="Hands-on work" />
        <StatCard icon={<Trophy size={20} />}   value={unlockedAchievements?.length || 0} label="Badges Earned" color="#8B5CF6"
          sub={`of ${ACHIEVEMENTS.length} total`} progress progressPct={Math.round(((unlockedAchievements?.length || 0) / ACHIEVEMENTS.length) * 100)} />
      </div>

      {/* ── XP Level card ────────────────────────────── */}
      <div className="pg-level-card">
        <div className="pg-level-left">
          <div className="pg-level-badge">Lv.{userLevel}</div>
          <div>
            <div className="pg-level-name">{levelName}</div>
            <div className="pg-level-xp">{totalXP} XP · Next level at {nextLevelXP[userLevel]} XP</div>
          </div>
        </div>
        <div className="pg-level-right">
          <div className="pg-level-pct">{xpProgress}%</div>
          <div className="pg-level-sub">to Level {userLevel + 1}</div>
        </div>
        <div className="pg-level-bar-wrap">
          <div className="pg-level-bar">
            <div className="pg-level-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Daily Goals ──────────────────────────────── */}
      <DailyGoals dailyGoals={dailyGoals} streak={streak} dailyGoalCount={dailyGoalCount} />

      {/* ── Goals + Suggestions row ──────────────────── */}
      <div className="pg-two-col">
        <GoalsSection goals={mem.goals || []} onSave={handleGoalSave} />
        <SuggestedTopics weakAreas={allWeak} recentTopics={allTopics} onTopicSelect={onTopicSelect} />
      </div>

      {/* ── Achievements ─────────────────────────────── */}
      <div className="pg-card">
        <div className="pg-card-header">
          <div className="pg-card-title-row">
            <Trophy size={16} style={{ color: "#F59E0B" }} />
            <h3>Achievements</h3>
          </div>
          <span className="pg-badge-count">{unlockedAchievements?.length || 0} / {ACHIEVEMENTS.length}</span>
        </div>
        <div className="pg-achievements-grid">
          {ACHIEVEMENTS.map(a => {
            const done = (unlockedAchievements || []).includes(a.id);
            return (
              <div key={a.id} className={`pg-achievement ${done ? "unlocked" : "locked"}`}>
                <span className="pg-achievement-icon">{a.icon}</span>
                <div className="pg-achievement-info">
                  <div className="pg-achievement-label">{a.label}</div>
                  <div className="pg-achievement-desc">{a.desc}</div>
                </div>
                {done && <CheckCircle size={14} style={{ color: "#10B981", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Weak areas ───────────────────────────────── */}
      {allWeak.length > 0 && (
        <div className="pg-card">
          <div className="pg-card-header">
            <div className="pg-card-title-row">
              <AlertCircle size={16} style={{ color: "#fca5a5" }} />
              <h3>Areas to Revisit</h3>
            </div>
          </div>
          <div className="pg-chips">
            {allWeak.map((w, i) => (
              <button key={i} className="pg-chip pg-chip-weak" onClick={() => onTopicSelect?.(w)}>{w}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Topics explored ──────────────────────────── */}
      {allTopics.length > 0 && (
        <div className="pg-card">
          <div className="pg-card-header">
            <div className="pg-card-title-row">
              <BookOpen size={16} style={{ color: "#22D3EE" }} />
              <h3>Topics Explored</h3>
            </div>
            <span className="pg-badge-count">{allTopics.length}</span>
          </div>
          <div className="pg-chips">
            {allTopics.map((t, i) => (
              <button key={i} className="pg-chip pg-chip-topic" onClick={() => onTopicSelect?.(t)}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quiz history ─────────────────────────────── */}
      {quizHistory.length > 0 && (
        <div className="pg-card">
          <div className="pg-card-header">
            <div className="pg-card-title-row">
              <Trophy size={16} style={{ color: "#A78BFA" }} />
              <h3>Quiz History</h3>
            </div>
          </div>
          <div className="pg-quiz-history">
            {quizHistory.slice(0, 10).map((q, i) => {
              const color = q.pct >= 80 ? "#10B981" : q.pct >= 50 ? "#F59E0B" : "#ef4444";
              return (
                <div key={i} className="pg-quiz-row">
                  <div className="pg-quiz-topic">{q.topic}</div>
                  <div className="pg-quiz-bar-wrap">
                    <div className="pg-quiz-bar">
                      <div className="pg-quiz-fill" style={{ width: `${q.pct}%`, background: color }} />
                    </div>
                  </div>
                  <div className="pg-quiz-score" style={{ color }}>{q.score}/{q.total}</div>
                  <div className="pg-quiz-pct" style={{ color }}>{q.pct}%</div>
                  <div className="pg-quiz-date">{q.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
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
