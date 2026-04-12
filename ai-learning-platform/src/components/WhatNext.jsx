import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Dumbbell, Briefcase, Map, Zap, TrendingUp, Brain } from "lucide-react";

/* ── Topic progression map ─────────────────────────────── */
const TOPIC_GRAPH = {
  "Recursion":              ["Dynamic Programming", "Tree Traversal", "Backtracking"],
  "Dynamic Programming":    ["Graph Algorithms", "Greedy Algorithms", "Advanced DP"],
  "Arrays":                 ["Linked Lists", "Stacks & Queues", "Sorting Algorithms"],
  "Sorting Algorithms":     ["Binary Search", "Divide and Conquer", "Heap"],
  "Binary Search":          ["Binary Search Trees", "Segment Trees", "Advanced Search"],
  "Graph Algorithms":       ["Shortest Path", "Minimum Spanning Tree", "Network Flow"],
  "Machine Learning":       ["Deep Learning", "NLP", "Computer Vision"],
  "Deep Learning":          ["Transformers", "CNNs", "Reinforcement Learning"],
  "Neural Networks":        ["Deep Learning", "Backpropagation", "CNNs"],
  "Python":                 ["Data Structures", "OOP in Python", "Python for ML"],
  "JavaScript":             ["React", "Node.js", "TypeScript"],
  "React":                  ["React Hooks", "State Management", "Next.js"],
  "React Hooks":            ["Context API", "Redux", "React Query"],
  "SQL":                    ["SQL Joins", "Indexing", "Query Optimization"],
  "SQL Joins":              ["Subqueries", "Window Functions", "Database Design"],
  "System Design":          ["Distributed Systems", "Microservices", "Load Balancing"],
  "DBSCAN":                 ["K-Means Clustering", "Hierarchical Clustering", "Dimensionality Reduction"],
  "Transformers":           ["BERT", "GPT Architecture", "Fine-tuning LLMs"],
  "Docker":                 ["Kubernetes", "CI/CD", "Container Orchestration"],
  "REST APIs":              ["GraphQL", "API Security", "Microservices"],
};

const FALLBACK_TOPICS = [
  "Data Structures", "Algorithms", "System Design",
  "Machine Learning", "Web Development", "SQL",
];

/* ── Action types ──────────────────────────────────────── */
const ACTION_TYPES = {
  learn:     { icon: BookOpen,  color: "#A78BFA", bg: "rgba(167,139,250,0.1)", label: "Learn"          },
  practice:  { icon: Dumbbell,  color: "#10B981", bg: "rgba(16,185,129,0.1)",  label: "Practice"       },
  interview: { icon: Briefcase, color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  label: "Interview Prep" },
  roadmap:   { icon: Map,       color: "#22D3EE", bg: "rgba(34,211,238,0.1)",  label: "Learning Plan"  },
  quiz:      { icon: Brain,     color: "#F97316", bg: "rgba(249,115,22,0.1)",  label: "Quiz"           },
};

/* ── Build recommendations ─────────────────────────────── */
function buildRecs({ recentTopics, weakAreas, userLevel, quizHistory, trigger }) {
  const recs = [];
  const seen = new Set(recentTopics.map(t => t.toLowerCase()));

  // 1. Next topics based on last learned
  const lastTopic = recentTopics[0];
  if (lastTopic) {
    const nexts = TOPIC_GRAPH[lastTopic] || [];
    nexts.slice(0, 2).forEach(t => {
      if (!seen.has(t.toLowerCase())) {
        recs.push({
          id: `learn-${t}`,
          type: "learn",
          topic: t,
          title: t,
          reason: `Natural next step after ${lastTopic}`,
          cta: "Start Learning",
        });
        seen.add(t.toLowerCase());
      }
    });
  }

  // 2. Weak areas — suggest practice
  weakAreas.slice(0, 2).forEach(w => {
    recs.push({
      id: `practice-${w}`,
      type: "practice",
      topic: w,
      title: `Practice: ${w}`,
      reason: "You struggled here — let's strengthen it",
      cta: "Practice Now",
    });
  });

  // 3. After course completion — suggest interview prep
  if (trigger === "completion" && lastTopic) {
    recs.push({
      id: `interview-${lastTopic}`,
      type: "interview",
      topic: lastTopic,
      title: `Interview Prep: ${lastTopic}`,
      reason: "You've learned it — now ace the interview",
      cta: "Prep Now",
    });
  }

  // 4. Level milestone — suggest roadmap
  if (trigger === "levelup" || userLevel >= 3) {
    recs.push({
      id: "roadmap-plan",
      type: "roadmap",
      topic: lastTopic || "your goal",
      title: "Build a 30-Day Plan",
      reason: "You're ready for a structured learning journey",
      cta: "Create Plan",
    });
  }

  // 5. Fill with fallbacks if < 3 recs
  if (recs.length < 3) {
    FALLBACK_TOPICS.filter(t => !seen.has(t.toLowerCase()))
      .slice(0, 3 - recs.length)
      .forEach(t => {
        recs.push({
          id: `learn-fallback-${t}`,
          type: "learn",
          topic: t,
          title: t,
          reason: "Popular topic to explore next",
          cta: "Start Learning",
        });
      });
  }

  return recs.slice(0, 4);
}

/* ══════════════════════════════════════════════════════════
   WhatNext Component
   ══════════════════════════════════════════════════════════ */
export default function WhatNext({
  recentTopics = [],
  weakAreas = [],
  userLevel = 1,
  quizHistory = [],
  trigger = "default", // "default" | "completion" | "levelup"
  onAction,            // ({ type, topic, page }) => void
  compact = false,
}) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const built = buildRecs({ recentTopics, weakAreas, userLevel, quizHistory, trigger });
    setRecs(built);
  }, [recentTopics.length, weakAreas.length, userLevel, trigger]);

  if (!recs.length) return null;

  const PAGE_MAP = {
    learn:     "learn",
    practice:  "playground",
    interview: "interviewprep",
    roadmap:   "learningplan",
    quiz:      "quiz",
  };

  const handleClick = (rec) => {
    onAction?.({ type: rec.type, topic: rec.topic, page: PAGE_MAP[rec.type] });
  };

  return (
    <div className={`wn-wrap ${compact ? "wn-compact" : ""}`}>
      <div className="wn-header">
        <div className="wn-header-left">
          <TrendingUp size={16} style={{ color: "#A78BFA" }} />
          <h3 className="wn-title">What's Next?</h3>
        </div>
        <span className="wn-subtitle">
          {trigger === "completion" ? "You finished — keep the momentum!" :
           trigger === "levelup"    ? "You levelled up — explore more!" :
           "Personalised for you"}
        </span>
      </div>

      <div className={`wn-grid ${compact ? "wn-grid-compact" : ""}`}>
        {recs.map(rec => {
          const cfg = ACTION_TYPES[rec.type];
          const Icon = cfg.icon;
          return (
            <button key={rec.id} className="wn-card" onClick={() => handleClick(rec)}>
              <div className="wn-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                <Icon size={18} />
              </div>
              <div className="wn-card-body">
                <div className="wn-card-type" style={{ color: cfg.color }}>{cfg.label}</div>
                <div className="wn-card-title">{rec.title}</div>
                <div className="wn-card-reason">{rec.reason}</div>
              </div>
              <div className="wn-card-cta" style={{ color: cfg.color }}>
                {rec.cta} <ArrowRight size={13} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
