import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle, Circle, ChevronDown, ChevronUp, Clock, Download, ChevronLeft, ChevronRight, Star, Trophy } from "lucide-react";
import { fetchDailyPlan, fetchRoadmapOverview } from "../api";
import CompletionScreen from "../components/CompletionScreen";

const LEVELS = ["beginner", "intermediate", "advanced"];

const PHASE_CFG = {
  concept:  { color: "#a78bfa", bg: "#1a104020", icon: "🧠", label: "Concept" },
  learn:    { color: "#38bdf8", bg: "#0c1a2e20", icon: "📘", label: "Learn" },
  practice: { color: "#10b981", bg: "#052e1620", icon: "💪", label: "Practice" },
  apply:    { color: "#f59e0b", bg: "#1a150020", icon: "🚀", label: "Apply" },
  revise:   { color: "#ec4899", bg: "#1a0a1420", icon: "🔁", label: "Revise" },
};

const PLAN_KEY = "mentorai_daily_plans";
const DONE_KEY = "mentorai_done_days";

function savePlan(data) {
  const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
  localStorage.setItem(PLAN_KEY, JSON.stringify([{ ...data, savedAt: Date.now() }, ...saved.filter(p => p.goal !== data.goal)].slice(0, 5)));
}
function getSavedPlans() { return JSON.parse(localStorage.getItem(PLAN_KEY) || "[]"); }
function loadDoneDays(goal) {
  try { return JSON.parse(localStorage.getItem(`${DONE_KEY}_${goal}`) || "{}"); } catch { return {}; }
}
function saveDoneDays(goal, done) {
  localStorage.setItem(`${DONE_KEY}_${goal}`, JSON.stringify(done));
}

function exportPlan(data) {
  const lines = [`# ${data.title}`, `Goal: ${data.goal} | Level: ${data.level}`, ""];
  data.days?.forEach(d => {
    lines.push(`## Day ${d.day}: ${d.title} (${d.time})`);
    Object.entries(PHASE_CFG).forEach(([k, v]) => lines.push(`${v.icon} ${v.label}: ${d[k]}`));
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${data.goal.replace(/\s+/g, "_")}_30day.txt`; a.click();
  URL.revokeObjectURL(url);
}

// ── Roadmap Overview ──────────────────────────────────
function RoadmapOverview({ phases }) {
  if (!phases?.length) return null;
  const colors = ["#a78bfa", "#38bdf8", "#10b981", "#f59e0b"];
  return (
    <div className="roadmap-overview">
      <div className="roadmap-overview-title">🗺️ Learning Path Overview</div>
      <div className="roadmap-phases-row">
        {phases.map((p, i) => (
          <div key={i} className="roadmap-phase-chip" style={{ borderColor: `${colors[i]}40` }}>
            <div className="rp-num" style={{ background: colors[i] }}>{p.phase}</div>
            <div>
              <div className="rp-title" style={{ color: colors[i] }}>{p.title}</div>
              <div className="rp-duration">{p.duration}</div>
              <div className="rp-topics">{p.topics?.slice(0, 3).join(" · ")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Today's Task — Full Focus Card ────────────────────
function TodayFocusCard({ day, totalDays, completedCount, onComplete, onPrev, onNext, hasPrev, hasNext }) {
  const [celebrating, setCelebrating] = useState(false);
  const pct = Math.round((completedCount / totalDays) * 100);

  const handleComplete = () => {
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      onComplete();
    }, 800);
  };

  return (
    <div className={`today-focus-card ${celebrating ? "celebrating" : ""}`}>
      {/* Header */}
      <div className="today-focus-header">
        <div className="today-focus-meta">
          <span className="today-badge">⭐ Today</span>
          <span className="today-day-num">Day {day.day} of {totalDays}</span>
          <span className="today-time"><Clock size={13} /> {day.time}</span>
        </div>
        <div className="today-nav">
          <button className="today-nav-btn" onClick={onPrev} disabled={!hasPrev}><ChevronLeft size={16} /></button>
          <button className="today-nav-btn" onClick={onNext} disabled={!hasNext}><ChevronRight size={16} /></button>
        </div>
      </div>

      <h3 className="today-focus-title">{day.title}</h3>

      {/* Progress */}
      <div className="today-progress-row">
        <div className="today-progress-bar">
          <div className="today-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="today-progress-pct">{pct}% complete</span>
      </div>

      {/* 5 phases */}
      <div className="today-phases-grid">
        {Object.entries(PHASE_CFG).map(([key, cfg]) => (
          <div key={key} className="today-phase-card" style={{ borderColor: `${cfg.color}30`, background: cfg.bg }}>
            <div className="today-phase-header" style={{ color: cfg.color }}>
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>
            <p className="today-phase-text">{day[key]}</p>
          </div>
        ))}
      </div>

      {/* Mark complete */}
      <button className={`today-complete-btn ${celebrating ? "done" : ""}`} onClick={handleComplete}>
        {celebrating
          ? <><Trophy size={18} /> Completed! Moving to next day...</>
          : <><CheckCircle size={18} /> Mark as Complete</>}
      </button>
    </div>
  );
}

// ── Compact Day Row ───────────────────────────────────
function DayRow({ day, done, isToday, onSelect }) {
  return (
    <button
      className={`day-row ${done ? "done" : ""} ${isToday ? "today" : ""}`}
      onClick={() => onSelect(day.day)}
    >
      <div className="day-row-check">
        {done ? <CheckCircle size={15} style={{ color: "#10b981" }} /> : <Circle size={15} style={{ color: "#334155" }} />}
      </div>
      <div className="day-row-num" style={{ color: isToday ? "#f59e0b" : done ? "#10b981" : "#475569" }}>
        {isToday ? "⭐" : `D${day.day}`}
      </div>
      <div className="day-row-title">{day.title}</div>
      <div className="day-row-time"><Clock size={11} /> {day.time}</div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function DailyPlanPage() {
  const [goal, setGoal] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
      return saved.length > 0 ? saved[0].goal : "";
    } catch { return ""; }
  });
  const [level, setLevel] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
      return saved.length > 0 ? (saved[0].level || "beginner") : "beginner";
    } catch { return "beginner"; }
  });
  const [doneDays, setDoneDays] = useState(() => {
    // On mount, try to restore done days for the most recent saved plan
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
      if (saved.length > 0) {
        return loadDoneDays(saved[0].goal);
      }
    } catch {}
    return {};
  });
  const [data, setData] = useState(() => {
    // Restore last active plan on mount
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
      return saved.length > 0 ? saved[0] : null;
    } catch { return null; }
  });
  const [overview, setOverview] = useState(null);
  const [currentDay, setCurrentDay] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
      if (saved.length > 0) {
        const done = loadDoneDays(saved[0].goal);
        const next = saved[0].days?.find(d => !done[d.day]);
        return next?.day || 1;
      }
    } catch {}
    return 1;
  });
  const [saved, setSaved]       = useState(getSavedPlans());
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState("");
  const [view, setView]         = useState("today"); // "today" | "all"
  const [showCompletion, setShowCompletion] = useState(false);

  const totalDays = data?.days?.length || 0;
  const completedCount = totalDays > 0 ? Object.values(doneDays).filter(Boolean).length : 0;
  const pct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const currentDayData = data?.days?.find(d => d.day === currentDay);

  const markComplete = () => {
    const updated = { ...doneDays, [currentDay]: true };
    setDoneDays(updated);
    if (data?.goal) saveDoneDays(data.goal, updated);
    // Check if all days done → show completion screen
    const allDone = data?.days?.every(d => updated[d.day]);
    if (allDone) {
      setTimeout(() => setShowCompletion(true), 600);
      return;
    }
    // Auto-advance to next incomplete day
    const next = data?.days?.find(d => d.day > currentDay && !updated[d.day]);
    if (next) setCurrentDay(next.day);
  };

  const generate = async (e) => {
    e?.preventDefault();
    if (!goal.trim()) return;
    setLoading(true); setData(null); setOverview(null);
    setDoneDays({}); setCurrentDay(1);
    setProgress("Building roadmap overview...");
    try {
      const [ovRes] = await Promise.all([fetchRoadmapOverview(goal.trim(), level)]);
      setOverview(ovRes.data);
      setProgress("Generating days 1–10...");
      setTimeout(() => setProgress("Generating days 11–20..."), 3000);
      setTimeout(() => setProgress("Generating days 21–30..."), 6000);
      const planRes = await fetchDailyPlan(goal.trim(), level);
      setData(planRes.data);
      savePlan(planRes.data);
      setSaved(getSavedPlans());
      setCurrentDay(1);
    } catch { alert("Failed to generate. Please try again."); }
    finally { setLoading(false); setProgress(""); }
  };

  const loadSaved = (p) => {
    setData(p);
    const done = loadDoneDays(p.goal);
    setDoneDays(done);
    const next = p.days?.find(d => !done[d.day]);
    setCurrentDay(next?.day || 1);
  };

  return (
    <div className="daily-plan-page">
      {/* Completion screen overlay */}
      {showCompletion && data && (
        <CompletionScreen
          goal={data.goal}
          level={data.level}
          onStartNext={() => { setShowCompletion(false); setData(null); setOverview(null); setDoneDays({}); setGoal(""); }}
          onDismiss={() => setShowCompletion(false)}
        />
      )}

      {/* Input */}
      <div className="gr-input-section">
        <div className="gr-input-header">
          <CalendarDays size={20} style={{ color: "#ec4899", flexShrink: 0 }} />
          <div>
            <h2>Learning Plan</h2>
            <p>Roadmap overview + 30-day daily tasks — your complete learning journey</p>
          </div>
        </div>
        <form className="gr-form" onSubmit={generate}>
          <input className="gr-goal-input" placeholder='e.g. "Learn Python", "Master React", "Understand Machine Learning"'
            value={goal} onChange={e => setGoal(e.target.value)} />
          <div className="gr-controls">
            <div className="gr-control-group">
              <label>Level</label>
              <div className="gr-btns">
                {LEVELS.map(l => <button key={l} type="button" className={`ctrl-btn ${level === l ? "active" : ""}`} onClick={() => setLevel(l)}>{l}</button>)}
              </div>
            </div>
            <button type="submit" className="generate-btn gr-submit" disabled={loading || !goal.trim()}
              style={{ background: "linear-gradient(135deg, #be185d, #ec4899)" }}>
              <CalendarDays size={15} /> {loading ? (progress || "Generating...") : "Generate My Plan"}
            </button>
          </div>
        </form>
      </div>

      {/* Saved */}
      {!data && saved.length > 0 && (
        <div className="gr-saved">
          <div className="gr-saved-label">📂 Saved Plans</div>
          <div className="topic-chips">
            {saved.map((p, i) => <button key={i} className="topic-chip recent" onClick={() => loadSaved(p)}>{p.goal}</button>)}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loader-wrap" style={{ padding: "3rem" }}>
          <div className="spinner" style={{ borderTopColor: "#ec4899" }} />
          <p>{progress || "Building your plan..."}</p>
        </div>
      )}

      {/* Roadmap Overview */}
      {overview && <RoadmapOverview phases={overview.phases} />}

      {/* Plan */}
      {data && !loading && (
        <div className="daily-plan-result">
          {/* Stats + view toggle */}
          <div className="daily-plan-header">
            <div>
              <h3>{data.title}</h3>
              <div className="gr-meta">
                <span>🎯 {data.goal}</span><span>·</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>{completedCount}/{totalDays} days · {pct}%</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className={`ctrl-btn ${view === "today" ? "active" : ""}`} onClick={() => setView("today")}>⭐ Today</button>
              <button className={`ctrl-btn ${view === "all" ? "active" : ""}`} onClick={() => setView("all")}>📋 All Days</button>
              <button className="content-action-btn" onClick={() => exportPlan(data)}><Download size={14} /></button>
            </div>
          </div>

          {/* Today's Task view */}
          {view === "today" && currentDayData && (
            <TodayFocusCard
              day={currentDayData}
              totalDays={totalDays}
              completedCount={completedCount}
              onComplete={markComplete}
              onPrev={() => setCurrentDay(d => Math.max(1, d - 1))}
              onNext={() => setCurrentDay(d => Math.min(totalDays, d + 1))}
              hasPrev={currentDay > 1}
              hasNext={currentDay < totalDays}
            />
          )}

          {/* All days view */}
          {view === "all" && (
            <div className="day-rows-list">
              {data.days?.map(day => (
                <DayRow
                  key={day.day}
                  day={day}
                  done={!!doneDays[day.day]}
                  isToday={day.day === currentDay}
                  onSelect={(n) => { setCurrentDay(n); setView("today"); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
