import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";

/* ── Achievement badge unlock popup ────────────────────── */
export default function AchievementToast({ achievement }) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!achievement) return;
    setKey(k => k + 1);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [achievement]);

  if (!achievement || !visible) return null;

  return (
    <div key={key} className="ach-popup">
      {/* Shimmer overlay */}
      <div className="ach-popup-shimmer" />

      <div className="ach-popup-left">
        <div className="ach-popup-badge-wrap">
          <div className="ach-popup-ring" />
          <div className="ach-popup-badge">{achievement.icon}</div>
        </div>
      </div>

      <div className="ach-popup-body">
        <div className="ach-popup-eyebrow">
          <Trophy size={11} /> Achievement Unlocked!
        </div>
        <div className="ach-popup-name">{achievement.label}</div>
        <div className="ach-popup-desc">{achievement.desc}</div>
      </div>

      <button className="ach-popup-close" onClick={() => setVisible(false)}>
        <X size={13} />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className="ach-popup-timer" />
    </div>
  );
}
