import { useMemo } from "react";
import { Zap, TrendingUp, BookOpen, Dumbbell, ArrowRight, Flame } from "lucide-react";

/* ── Generate contextual suggestions ──────────────────── */
function buildSuggestions({ xp, userLevel, xpProgress, streak, recentTopics, dailyGoalCount, nextLevelXP, levelNames }) {
  const suggestions = [];
  const lastTopic = recentTopics?.[0];

  // Close to next level
  if (xpProgress >= 70 && userLevel < 7) {
    const needed = Math.round(((nextLevelXP[userLevel] - nextLevelXP[userLevel - 1]) * (100 - xpProgress)) / 100);
    suggestions.push({
      id: "level-close",
      icon: <TrendingUp size={14} />,
      color: "#A78BFA",
      text: `Only ~${needed} XP to Level ${userLevel + 1} (${levelNames[userLevel + 1]})`,
      cta: "Earn XP",
      action: "generate",
    });
  }

  // Continue last topic
  if (lastTopic) {
    suggestions.push({
      id: "continue-topic",
      icon: <BookOpen size={14} />,
      color: "#22D3EE",
      text: `Continue learning: ${lastTopic}`,
      cta: "Resume",
      action: "resume",
      topic: lastTopic,
    });
  }

  // Practice suggestion
  if (lastTopic && dailyGoalCount < 2) {
    suggestions.push({
      id: "practice-topic",
      icon: <Dumbbell size={14} />,
      color: "#10B981",
      text: `Try Practice for "${lastTopic}"`,
      cta: "Practice",
      action: "practice",
      topic: lastTopic,
    });
  }

  // Streak encouragement
  if (streak >= 2 && streak < 7) {
    suggestions.push({
      id: "streak",
      icon: <Flame size={14} />,
      color: "#F59E0B",
      text: `${streak}-day streak! Keep it going — learn something today`,
      cta: "Learn Now",
      action: "generate",
    });
  }

  // Daily goals nudge
  if (dailyGoalCount === 0) {
    suggestions.push({
      id: "daily-goals",
      icon: <Zap size={14} />,
      color: "#8B5CF6",
      text: "Complete today's 3 tasks to earn +100 XP",
      cta: "Start",
      action: "generate",
    });
  }

  return suggestions.slice(0, 3);
}

/* ══════════════════════════════════════════════════════════
   AISuggestions — small adaptive suggestion cards
   ══════════════════════════════════════════════════════════ */
export default function AISuggestions({
  xp, userLevel, xpProgress, streak, recentTopics,
  dailyGoalCount, nextLevelXP, levelNames,
  onGenerate, onNavigate,
}) {
  const suggestions = useMemo(() => buildSuggestions({
    xp, userLevel, xpProgress, streak, recentTopics,
    dailyGoalCount, nextLevelXP, levelNames,
  }), [xp, userLevel, xpProgress, streak, recentTopics?.length, dailyGoalCount]);

  if (!suggestions.length) return null;

  const handleClick = (s) => {
    if (s.action === "resume" || s.action === "practice") {
      onGenerate?.(s.topic);
    } else {
      onGenerate?.();
    }
  };

  return (
    <div className="ais-wrap">
      <div className="ais-label">
        <Zap size={12} /> AI Suggestions
      </div>
      <div className="ais-list">
        {suggestions.map(s => (
          <button key={s.id} className="ais-card" onClick={() => handleClick(s)}>
            <span className="ais-icon" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</span>
            <span className="ais-text">{s.text}</span>
            <span className="ais-cta" style={{ color: s.color }}>
              {s.cta} <ArrowRight size={11} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
