import { useEffect, useState } from "react";

export default function AchievementToast({ achievement }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3800);
      return () => clearTimeout(t);
    }
  }, [achievement]);

  if (!achievement || !visible) return null;

  return (
    <div className="achievement-toast">
      <span className="achievement-toast-icon">{achievement.icon}</span>
      <div>
        <div className="achievement-toast-title">Achievement Unlocked!</div>
        <div className="achievement-toast-label">{achievement.label} — {achievement.desc}</div>
      </div>
    </div>
  );
}
