import { useMemo } from "react";
import { BookOpen, Dumbbell, RotateCcw, ArrowRight, Sparkles, Brain, Map } from "lucide-react";

const NEXT_TOPIC = {
  "Recursion": "Dynamic Programming", "Dynamic Programming": "Graph Algorithms",
  "Arrays": "Linked Lists", "Linked Lists": "Trees & BST", "Trees & BST": "Heaps",
  "Sorting Algorithms": "Binary Search", "Binary Search": "Divide and Conquer",
  "Graph Algorithms": "Shortest Path", "Machine Learning": "Deep Learning",
  "Deep Learning": "Transformers & LLMs", "Neural Networks": "Deep Learning",
  "Python": "Data Structures in Python", "JavaScript": "React", "React": "Next.js",
  "React Hooks": "State Management", "SQL": "SQL Joins", "SQL Joins": "Window Functions",
  "System Design": "Distributed Systems", "Docker": "Kubernetes", "REST APIs": "GraphQL",
  "DBSCAN": "K-Means Clustering", "Transformers": "Fine-tuning LLMs",
};

const POPULAR_FALLBACK = ["Data Structures", "System Design", "Machine Learning", "React", "SQL", "Python", "Algorithms"];

const TYPE_CONFIG = {
  retry:     { icon: <RotateCcw size={15} />, color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  tag: "Retry Quiz"     },
  practice:  { icon: <Dumbbell size={15} />,  color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  tag: "Practice"       },
  learn:     { icon: <BookOpen size={15} />,  color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", tag: "Next Topic"     },
  interview: { icon: <Brain size={15} />,     color: "#22D3EE", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)",  tag: "Interview Prep" },
  roadmap:   { icon: <Map size={15} />,       color: "#8B5CF6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  tag: "Learning Plan"  },
  explore:   { icon: <Sparkles size={15} />,  color: "#A78BFA", bg: "rgba(167,139,250,0.08)",border: "rgba(167,139,250,0.2)",  tag: "Popular"        },
};

function buildRecs({ recentTopics, quizHistory, weakAreas }) {
  const recs = [];
  const seen = new Set(recentTopics.map(t => t.toLowerCase()));

  quizHistory.filter(q => q.pct < 60).slice(0, 1).forEach(q => {
    recs.push({ id: `retry-${q.topic}`, type: "retry", title: q.topic,
      reason: `You scored ${q.pct}% — a retry will strengthen your understanding.`, action: "learn", topic: q.topic });
  });

  weakAreas.slice(0, 1).forEach(w => {
    if (!recs.find(r => r.topic === w))
      recs.push({ id: `practice-${w}`, type: "practice", title: w,
        reason: "You struggled here in a quiz. Practice will make it stick.", action: "practice", topic: w });
  });

  const lastTopic = recentTopics[0];
  if (lastTopic) {
    const next = NEXT_TOPIC[lastTopic];
    if (next && !seen.has(next.toLowerCase()))
      recs.push({ id: `next-${next}`, type: "learn", title: next,
        reason: `Natural next step after "${lastTopic}".`, action: "learn", topic: next });
  }

  const highScore = quizHistory.filter(q => q.pct >= 80).map(q => q.topic).find(t => !recs.find(r => r.topic === t));
  if (highScore)
    recs.push({ id: `interview-${highScore}`, type: "interview", title: highScore,
      reason: `You scored 80%+ — you're ready to ace interview questions.`, action: "interviewprep", topic: highScore });

  if (recentTopics.length >= 3 && recs.length < 4)
    recs.push({ id: "roadmap", type: "roadmap", title: "Build a 30-Day Plan",
      reason: `You've learned ${recentTopics.length} topics — time for a structured roadmap.`, action: "learningplan", topic: null });

  POPULAR_FALLBACK.filter(t => !seen.has(t.toLowerCase())).slice(0, Math.max(0, 3 - recs.length)).forEach(t => {
    recs.push({ id: `explore-${t}`, type: "explore", title: t,
      reason: "Popular topic — great for building a strong foundation.", action: "learn", topic: t });
  });

  return recs.slice(0, 3);
}

export default function Recommendations({ recentTopics = [], quizHistory = [], weakAreas = [], onAction }) {
  const recs = useMemo(() => buildRecs({ recentTopics, quizHistory, weakAreas }),
    [recentTopics.length, quizHistory.length, weakAreas.length]);

  if (!recs.length) return null;

  const handleClick = (rec) => {
    if (rec.action === "learn" || rec.action === "practice") {
      onAction?.({ type: rec.action, topic: rec.topic, page: rec.action === "practice" ? "playground" : "learn" });
    } else {
      onAction?.({ type: rec.action, topic: rec.topic, page: rec.action });
    }
  };

  return (
    <div className="rec2-wrap">
      <div className="rec2-header">
        <Sparkles size={14} style={{ color: "#A78BFA" }} />
        <span className="rec2-title">Recommended for you</span>
        <span className="rec2-sub">Based on your activity</span>
      </div>

      <div className="rec2-grid">
        {recs.map(rec => {
          const cfg = TYPE_CONFIG[rec.type];
          return (
            <button key={rec.id} className="rec2-card" onClick={() => handleClick(rec)}
              style={{ "--rc": cfg.color, "--rc-border": cfg.border }}>
              {/* Top: tag */}
              <div className="rec2-tag" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                {cfg.icon} {cfg.tag}
              </div>
              {/* Title */}
              <div className="rec2-card-title">{rec.title}</div>
              {/* Reason */}
              <div className="rec2-card-reason">{rec.reason}</div>
              {/* CTA */}
              <div className="rec2-card-cta" style={{ color: cfg.color }}>
                Explore <ArrowRight size={12} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
