import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, BookOpen, Map, Dumbbell, Briefcase, Clock, Star, CheckCircle, Eye, Lightbulb, RefreshCw, HelpCircle, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { fetchSearchAnswer, fetchDetectIntent } from "../api";

const EXPLORE_MODES = [
  { id: "learn",     label: "Full Breakdown",  icon: BookOpen,  color: "#a78bfa", desc: "Deep step-by-step explanation" },
  { id: "practice",  label: "Practice",        icon: Dumbbell,  color: "#10b981", desc: "Questions + AI feedback" },
  { id: "interview", label: "Interview Prep",  icon: Briefcase, color: "#f59e0b", desc: "Q&A + key points" },
  { id: "roadmap",   label: "Learning Path",   icon: Map,       color: "#38bdf8", desc: "Structured roadmap" },
];

function QuickPractice({ questions }) {
  const [answers, setAnswers]   = useState({});
  const [revealed, setRevealed] = useState({});

  if (!questions?.length) return null;

  return (
    <div className="ra-section">
      <div className="ra-section-header"><Zap size={15} /><span>Quick Practice</span></div>
      <div className="ra-practice-list">
        {questions.map((q, i) => (
          <div key={i} className="ra-practice-item">
            <p className="ra-practice-q">Q{i + 1}. {q.question}</p>
            <div className="ra-practice-row">
              <input
                className="ra-practice-input"
                placeholder="Your answer..."
                value={answers[i] || ""}
                onChange={e => setAnswers(p => ({ ...p, [i]: e.target.value }))}
                disabled={revealed[i]}
              />
              {!revealed[i] && (
                <button className="ra-reveal-btn" onClick={() => setRevealed(p => ({ ...p, [i]: true }))}>
                  Check
                </button>
              )}
            </div>
            {revealed[i] && (
              <div className="ra-practice-answer">
                <CheckCircle size={13} /> {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractiveActions({ actions, onSearch }) {
  const [active, setActive]   = useState(null);
  const [content, setContent] = useState(null);

  if (!actions) return null;

  const BTNS = [
    { key: "simpler_explanation",    label: "Explain Simpler",  icon: <Lightbulb size={13} /> },
    { key: "another_example",        label: "Another Example",  icon: <RefreshCw size={13} /> },
    { key: "real_world_application", label: "Real-world Use",   icon: <Zap size={13} /> },
  ];

  const trigger = (key) => {
    if (active === key) { setActive(null); setContent(null); return; }
    setActive(key);
    setContent(actions[key]);
  };

  return (
    <div className="ra-section">
      <div className="ra-section-header"><HelpCircle size={15} /><span>Interactive Actions</span></div>
      <div className="ra-action-btns">
        {BTNS.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`ra-action-btn ${active === key ? "active" : ""}`}
            onClick={() => trigger(key)}
          >
            {icon} {label}
          </button>
        ))}
      </div>
      {content && (
        <div className="ra-action-result">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}

function RichAnswerCard({ data, onExploreMode, onFollowUp, loading }) {
  const [showVisual, setShowVisual] = useState(true);

  return (
    <div className="rich-answer-card">
      <div className="rich-answer-title">{data.topic}</div>

      {/* Definition */}
      {data.definition && (
        <div className="ra-section ra-definition-section">
          <div className="ra-section-header"><BookOpen size={15} /><span>Definition</span></div>
          <p className="rich-definition">{data.definition}</p>
        </div>
      )}

      {/* Explanation */}
      {data.explanation && (
        <div className="ra-section">
          <div className="ra-section-header"><Lightbulb size={15} /><span>Explanation</span></div>
          <p className="rich-text">{data.explanation}</p>
        </div>
      )}

      {/* Real world example */}
      {data.real_world_example && (
        <div className="ra-section">
          <div className="ra-section-header"><span>🌍</span><span>Real World Example</span></div>
          <div className="rich-example">{data.real_world_example}</div>
        </div>
      )}

      {/* Visual explanation */}
      {data.visual_explanation && (
        <div className="ra-section ra-visual-section">
          <button className="ra-section-header ra-toggle" onClick={() => setShowVisual(v => !v)}>
            <Eye size={15} /><span>Visualize It</span>
            {showVisual ? <ChevronUp size={14} style={{ marginLeft: "auto" }} /> : <ChevronDown size={14} style={{ marginLeft: "auto" }} />}
          </button>
          {showVisual && (
            <div className="ra-visual-box">
              <p>{data.visual_explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Key points */}
      {data.key_points?.length > 0 && (
        <div className="ra-section">
          <div className="ra-section-header"><span>🔑</span><span>Key Points</span></div>
          <ul className="rich-key-points">
            {data.key_points.map((p, i) => (
              <li key={i}><CheckCircle size={13} className="rich-check" />{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick breakdown */}
      {data.quick_breakdown?.length > 0 && (
        <div className="ra-section">
          <div className="ra-section-header"><span>⚙️</span><span>How It Works</span></div>
          <ol className="rich-breakdown">
            {data.quick_breakdown.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      {/* Interactive actions */}
      <InteractiveActions actions={data.interactive_actions} />

      {/* Quick practice */}
      <QuickPractice questions={data.quick_practice} />

      {/* Explore modes */}
      <div className="ra-section">
        <div className="ra-section-header"><span>🚀</span><span>Want to go deeper?</span></div>
        <div className="rich-explore-modes">
          {EXPLORE_MODES.map(({ id, label, icon: Icon, color, desc }) => (
            <button key={id} className="rich-mode-btn" onClick={() => onExploreMode(id)} disabled={loading} style={{ "--mc": color }}>
              <Icon size={15} style={{ color }} />
              <div><div className="rich-mode-label">{label}</div><div className="rich-mode-desc">{desc}</div></div>
              <ArrowRight size={13} className="rich-mode-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up */}
      {data.explore_more?.length > 0 && (
        <div className="ra-section">
          <div className="ra-section-header"><span>🔍</span><span>Explore More</span></div>
          <div className="rich-followup-chips">
            {data.explore_more.map((q, i) => (
              <button key={i} className="suggestion-chip" onClick={() => onFollowUp(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home({ topic, setTopic, recentTopics, mode, setMode, onGenerate, setPage,
  xp = 0, userLevel = 1, levelName = "Beginner", xpProgress = 0, streak = 1,
  dailyGoals = {}, dailyGoalCount = 0, unlockedAchievements = [], completedCount = 0
}) {
  const [query, setQuery]     = useState(topic || "");
  const [answer, setAnswer]   = useState(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setQuery(text);
    setAnswer(null);
    setSearching(true);
    try {
      const r = await fetchSearchAnswer(text);
      setAnswer(r.data);
      setTopic(r.data.topic || text);
    } catch {
      setAnswer({ topic: text, definition: "Something went wrong. Please try again.", key_points: [], explore_more: [] });
    } finally {
      setSearching(false);
    }
  };

  const handleExploreMode = (selectedMode) => {
    setMode(selectedMode);
    onGenerate(answer?.topic || query);
    setPage("learn");
  };

  return (
    <div className="home-search-page">

      {/* ── Habit Dashboard Bar ── */}
      <div className="habit-bar">
        <div className="habit-stat">
          <span className="habit-stat-icon">🔥</span>
          <div>
            <div className="habit-stat-val">{streak}</div>
            <div className="habit-stat-label">Day Streak</div>
          </div>
        </div>
        <div className="habit-stat">
          <span className="habit-stat-icon">⚡</span>
          <div>
            <div className="habit-stat-val">{xp}</div>
            <div className="habit-stat-label">XP</div>
          </div>
        </div>
        <div className="habit-stat habit-level">
          <div className="habit-level-info">
            <span className="habit-level-badge">Lv.{userLevel}</span>
            <span className="habit-level-name">{levelName}</span>
          </div>
          <div className="habit-xp-bar">
            <div className="habit-xp-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="habit-stat">
          <span className="habit-stat-icon">🎯</span>
          <div>
            <div className="habit-stat-val">{dailyGoalCount}/3</div>
            <div className="habit-stat-label">Today's Goals</div>
          </div>
        </div>
        <div className="habit-stat">
          <span className="habit-stat-icon">🏆</span>
          <div>
            <div className="habit-stat-val">{unlockedAchievements.length}</div>
            <div className="habit-stat-label">Badges</div>
          </div>
        </div>
        <button className="habit-progress-btn" onClick={() => setPage("progress")}>
          View Progress →
        </button>
      </div>

      {/* Search bar */}
      <div className={`home-search-hero ${answer ? "compact" : ""}`}>
        {!answer && (
          <div className="home-search-heading">
            <h2>Learn Anything with Mentor<span className="logo-ai">AI</span></h2>
            <p>Your personal AI tutor for learning, practice, and interview preparation.</p>
          </div>
        )}

        <form
          className="home-search-bar"
          onSubmit={e => { e.preventDefault(); console.log("Submit triggered:", query); handleSearch(); }}
        >
          <Search size={20} className="home-search-icon" />
          <input
            ref={inputRef}
            className="home-search-input"
            placeholder="e.g. DBSCAN, recursion, how does ML work..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="home-search-btn"
            disabled={searching || !query.trim()}
          >
            {searching
              ? <span className="tutor-spinner" style={{ borderTopColor: "#fff" }} />
              : <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      {/* Loading */}
      {searching && (
        <div className="search-answer-loading">
          <div className="spinner" /><p>Thinking...</p>
        </div>
      )}

      {/* Rich answer */}
      {answer && !searching && (
        <RichAnswerCard
          data={answer}
          onExploreMode={handleExploreMode}
          onFollowUp={handleSearch}
          loading={searching}
        />
      )}

      {/* Recent + Popular */}
      {!answer && !searching && (
        <div className="home-grid">
          {recentTopics.length > 0 && (
            <>
              {/* Continue Learning */}
              <div className="home-card continue-card" style={{ gridColumn: "1 / -1" }}>
                <div className="home-card-title">▶️ Continue Learning</div>
                <div className="continue-topic">
                  <span>{recentTopics[0]}</span>
                  <button className="generate-btn" style={{ padding: "0.35rem 1rem", fontSize: "0.82rem" }}
                    onClick={() => onGenerate(recentTopics[0])}>
                    Continue →
                  </button>
                </div>
              </div>
              <div className="home-card">
                <div className="home-card-title"><Clock size={14} /> Recently Learned</div>
                <div className="topic-chips">
                  {recentTopics.map((t, i) => (
                    <button key={i} className="topic-chip recent" onClick={() => handleSearch(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="home-card">
            <div className="home-card-title"><Star size={14} /> Popular Topics</div>
            <div className="topic-chips">
              {["Recursion", "Neural Networks", "SQL Joins", "React Hooks", "Dynamic Programming", "System Design", "DBSCAN", "Transformers"].map((t, i) => (
                <button key={i} className="topic-chip" onClick={() => handleSearch(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
