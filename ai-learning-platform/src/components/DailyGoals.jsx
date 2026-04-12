import { CheckCircle, Circle, Flame } from "lucide-react";

const GOALS = [
  { key: "learnTopic",       label: "Learn a topic",          xp: 50 },
  { key: "completePractice", label: "Complete a practice task", xp: 30 },
  { key: "takeQuiz",         label: "Take a quiz",             xp: 20 },
];

export default function DailyGoals({ dailyGoals, streak, dailyGoalCount }) {
  const total = GOALS.length;
  const pct   = Math.round((dailyGoalCount / total) * 100);

  return (
    <div className="daily-goals-card">
      <div className="daily-goals-header">
        <div>
          <h4>Today's Goals</h4>
          <p>{dailyGoalCount}/{total} completed</p>
        </div>
        <div className="streak-badge">
          <Flame size={16} />
          <span>{streak}</span>
          <span className="streak-label">day streak</span>
        </div>
      </div>

      <div className="daily-goals-bar">
        <div className="daily-goals-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="daily-goals-list">
        {GOALS.map(({ key, label, xp }) => (
          <div key={key} className={`daily-goal-item ${dailyGoals[key] ? "done" : ""}`}>
            {dailyGoals[key]
              ? <CheckCircle size={16} className="goal-check done" />
              : <Circle size={16} className="goal-check" />
            }
            <span>{label}</span>
            <span className="goal-xp">+{xp} XP</span>
          </div>
        ))}
      </div>

      {dailyGoalCount === total && (
        <div className="daily-goals-complete">
          🎉 All goals completed! Come back tomorrow to keep your streak.
        </div>
      )}
    </div>
  );
}
