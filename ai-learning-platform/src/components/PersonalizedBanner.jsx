import { useMemo } from "react";
import { ArrowRight, TrendingUp, BookOpen, Zap, Flame } from "lucide-react";

/* ── Pick the single most relevant action ──────────────── */
function getAction({ recentTopics, weakAreas, xpProgress, userLevel, streak, avgQuizScore, dailyGoalCount, levelNames }) {
  const lastTopic = recentTopics?.[0];

  // Level up imminent
  if (xpProgress >= 70 && userLevel < 7) {
    const nextName = levelNames?.[userLevel + 1] || `Level ${userLevel + 1}`;
    const remaining = 100 - xpProgress;
    return {
      type: "level",
      icon: <TrendingUp size={20} />,
      color: "#A78BFA",
      gradFrom: "#8B5CF6",
      gradTo: "#6D28D9",
      eyebrow: "Level Progress",
      title: `Almost Level ${userLevel + 1}!`,
      highlight: nextName,
      desc: `You're only ${remaining}% away from reaching`,
      cta: "Earn XP",
      action: "generate",
    };
  }

  // Continue last topic
  if (lastTopic) {
    return {
      type: "continue",
      icon: <BookOpen size={20} />,
      color: "#22D3EE",
      gradFrom: "#22D3EE",
      gradTo: "#0891B2",
      eyebrow: "Continue Learning",
      title: lastTopic,
      highlight: null,
      desc: "Pick up right where you left off",
      cta: "Resume",
      action: "resume",
      topic: lastTopic,
    };
  }

  // Streak
  if (streak >= 3) {
    return {
      type: "streak",
      icon: <Flame size={20} />,
      color: "#F59E0B",
      gradFrom: "#F59E0B",
      gradTo: "#D97706",
      eyebrow: `${streak}-Day Streak`,
      title: "Keep the momentum!",
      highlight: null,
      desc: "Learn something today to maintain your streak",
      cta: "Start Learning",
      action: "generate",
    };
  }

  // Daily goals
  if (dailyGoalCount < 3) {
    return {
      type: "goals",
      icon: <Zap size={20} />,
      color: "#8B5CF6",
      gradFrom: "#8B5CF6",
      gradTo: "#6D28D9",
      eyebrow: "Daily Goals",
      title: `${dailyGoalCount}/3 tasks done`,
      highlight: null,
      desc: "Complete all 3 tasks to earn your daily XP bonus",
      cta: "Go",
      action: "generate",
    };
  }

  return null;
}

export default function PersonalizedBanner({
  recentTopics, weakAreas, xpProgress, userLevel, streak,
  avgQuizScore, dailyGoalCount, levelNames,
  onGenerate, onNavigate,
}) {
  const action = useMemo(() => getAction({
    recentTopics, weakAreas, xpProgress, userLevel, streak,
    avgQuizScore, dailyGoalCount, levelNames,
  }), [recentTopics?.length, weakAreas?.length, xpProgress, userLevel, streak, avgQuizScore, dailyGoalCount]);

  if (!action) return null;

  const handleClick = () => {
    if (action.action === "resume" || action.action === "practice") onGenerate?.(action.topic);
    else onGenerate?.();
  };

  return (
    <div className="plb-card" style={{ "--plb-color": action.color, "--plb-from": action.gradFrom, "--plb-to": action.gradTo }}>
      {/* Ambient glow */}
      <div className="plb-ambient" />

      {/* Left: icon */}
      <div className="plb-icon-col">
        <div className="plb-icon-ring">
          <div className="plb-icon">{action.icon}</div>
        </div>
      </div>

      {/* Center: text */}
      <div className="plb-content">
        <div className="plb-eyebrow">{action.eyebrow}</div>
        <div className="plb-title">{action.title}</div>
        {action.desc && (
          <div className="plb-desc">
            {action.desc}{action.highlight && (
              <> <span className="plb-highlight">{action.highlight}</span></>
            )}
          </div>
        )}
      </div>

      {/* Right: CTA */}
      <button className="plb-cta-btn" onClick={handleClick}>
        {action.cta} <ArrowRight size={14} />
      </button>
    </div>
  );
}
