import { useState, useEffect } from "react";
import { Clock, Trash2, BookOpen, Map, Dumbbell, Briefcase, Bookmark, Download } from "lucide-react";
import { getHistory, getBookmarks, deleteFromHistory, exportAsText } from "../lib/storage";

const MODE_ICON  = { learn: BookOpen, roadmap: Map, practice: Dumbbell, interview: Briefcase };
const MODE_COLOR = { learn: "#a78bfa", roadmap: "#38bdf8", practice: "#10b981", interview: "#f59e0b" };

function HistoryCard({ entry, onReopen, onDelete }) {
  const Icon  = MODE_ICON[entry.mode]  || BookOpen;
  const color = MODE_COLOR[entry.mode] || "#a78bfa";
  const date  = new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="history-card">
      <div className="history-card-icon" style={{ color, background: `${color}15` }}>
        <Icon size={18} />
      </div>
      <div className="history-card-info">
        <div className="history-card-topic">{entry.topic}</div>
        <div className="history-card-meta">
          <span style={{ color }}>{entry.mode}</span>
          <span>·</span>
          <span>{entry.level}</span>
          <span>·</span>
          <span><Clock size={11} /> {date}</span>
        </div>
      </div>
      <div className="history-card-actions">
        <button className="history-action-btn" onClick={() => exportAsText(entry.topic, entry.mode, entry.modules)} title="Download">
          <Download size={14} />
        </button>
        <button className="history-action-btn danger" onClick={() => onDelete(entry.topic, entry.mode)} title="Delete">
          <Trash2 size={14} />
        </button>
        <button className="history-reopen-btn" onClick={() => onReopen(entry)}>
          Continue →
        </button>
      </div>
    </div>
  );
}

export default function HistoryPage({ onReopen }) {
  const [tab, setTab]         = useState("history");
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
    setBookmarks(getBookmarks());
  }, []);

  const handleDelete = (topic, mode) => {
    deleteFromHistory(topic, mode);
    setHistory(getHistory());
  };

  const items = tab === "history" ? history : bookmarks;

  return (
    <div className="history-page">
      <div className="page-heading">
        <h2>📂 Learning History</h2>
        <p>All your past learning sessions — click to continue</p>
      </div>

      <div className="history-tabs">
        <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          <Clock size={14} /> History ({history.length})
        </button>
        <button className={`tab-btn ${tab === "bookmarks" ? "active" : ""}`} onClick={() => setTab("bookmarks")}>
          <Bookmark size={14} /> Saved ({bookmarks.length})
        </button>
      </div>

      {items.length === 0 ? (
        <div className="page-empty">
          <div className="page-empty-icon">{tab === "history" ? "📂" : "🔖"}</div>
          <h3>{tab === "history" ? "No history yet" : "No saved topics"}</h3>
          <p>{tab === "history" ? "Generate a topic to start building your history." : "Bookmark topics to save them here."}</p>
        </div>
      ) : (
        <div className="history-list">
          {items.map((entry, i) => (
            <HistoryCard
              key={i}
              entry={entry}
              onReopen={onReopen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
