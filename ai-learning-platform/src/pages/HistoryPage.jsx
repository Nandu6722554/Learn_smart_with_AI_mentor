import { useState, useEffect } from "react";
import { Clock, Trash2, BookOpen, Map, Dumbbell, Briefcase, Bookmark, Download, ArrowRight, Search } from "lucide-react";
import { getHistory, getBookmarks, deleteFromHistory, exportAsText } from "../lib/storage";

const MODE_CONFIG = {
  learn:     { icon: BookOpen,  color: "#A78BFA", bg: "rgba(167,139,250,0.12)", label: "Learn"     },
  roadmap:   { icon: Map,       color: "#22D3EE", bg: "rgba(34,211,238,0.10)",  label: "Roadmap"   },
  practice:  { icon: Dumbbell,  color: "#10B981", bg: "rgba(16,185,129,0.10)",  label: "Practice"  },
  interview: { icon: Briefcase, color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  label: "Interview" },
};

function getConfig(mode) {
  return MODE_CONFIG[mode] || MODE_CONFIG.learn;
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ── History Card ──────────────────────────────────────── */
function HistoryCard({ entry, onReopen, onDelete }) {
  const cfg  = getConfig(entry.mode);
  const Icon = cfg.icon;
  const date = formatDate(entry.timestamp);

  return (
    <div className="hx-card">
      {/* Mode icon */}
      <div className="hx-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
        <Icon size={18} />
      </div>

      {/* Info */}
      <div className="hx-card-info">
        <div className="hx-card-topic">{entry.topic}</div>
        <div className="hx-card-meta">
          <span className="hx-mode-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}25` }}>
            {cfg.label}
          </span>
          {entry.level && (
            <span className="hx-level-badge">{entry.level}</span>
          )}
          <span className="hx-date"><Clock size={11} /> {date}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="hx-card-actions">
        <button className="hx-action-icon" onClick={() => exportAsText(entry.topic, entry.mode, entry.modules)} title="Export">
          <Download size={14} />
        </button>
        <button className="hx-action-icon hx-delete" onClick={() => onDelete(entry.topic, entry.mode)} title="Delete">
          <Trash2 size={14} />
        </button>
        <button className="hx-continue-btn" onClick={() => onReopen(entry)}>
          Continue <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════ */
export default function HistoryPage({ onReopen }) {
  const [tab, setTab]         = useState("history");
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    setHistory(getHistory());
    setBookmarks(getBookmarks());
  }, []);

  const handleDelete = (topic, mode) => {
    deleteFromHistory(topic, mode);
    setHistory(getHistory());
  };

  const items = tab === "history" ? history : bookmarks;
  const filtered = search.trim()
    ? items.filter(e => e.topic.toLowerCase().includes(search.toLowerCase()))
    : items;

  // Group by date label
  const groups = filtered.reduce((acc, entry) => {
    const label = formatDate(entry.timestamp);
    if (!acc[label]) acc[label] = [];
    acc[label].push(entry);
    return acc;
  }, {});

  return (
    <div className="hx-page">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="hx-header">
        <div>
          <h2 className="hx-title">Learning History</h2>
          <p className="hx-sub">All your past sessions — pick up where you left off</p>
        </div>
        <div className="hx-stats">
          <div className="hx-stat">
            <span className="hx-stat-val">{history.length}</span>
            <span className="hx-stat-label">Sessions</span>
          </div>
          <div className="hx-stat">
            <span className="hx-stat-val">{bookmarks.length}</span>
            <span className="hx-stat-label">Saved</span>
          </div>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────── */}
      <div className="hx-controls">
        <div className="hx-tabs">
          <button className={`hx-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
            <Clock size={14} /> History ({history.length})
          </button>
          <button className={`hx-tab ${tab === "bookmarks" ? "active" : ""}`} onClick={() => setTab("bookmarks")}>
            <Bookmark size={14} /> Saved ({bookmarks.length})
          </button>
        </div>
        <div className="hx-search-wrap">
          <Search size={14} className="hx-search-icon" />
          <input className="hx-search" placeholder="Search topics..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="hx-empty">
          <div className="hx-empty-icon">{tab === "history" ? "📂" : "🔖"}</div>
          <h3>{search ? "No results found" : tab === "history" ? "No history yet" : "No saved topics"}</h3>
          <p>{search ? "Try a different search term." : tab === "history" ? "Generate a topic to start building your history." : "Bookmark topics to save them here."}</p>
        </div>
      )}

      {/* ── Grouped list ───────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="hx-list">
          {Object.entries(groups).map(([dateLabel, entries]) => (
            <div key={dateLabel} className="hx-group">
              <div className="hx-group-label">{dateLabel}</div>
              <div className="hx-group-items">
                {entries.map((entry, i) => (
                  <HistoryCard key={i} entry={entry} onReopen={onReopen} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
