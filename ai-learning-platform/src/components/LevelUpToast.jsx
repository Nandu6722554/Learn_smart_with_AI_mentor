import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function LevelUpToast({ levelUp }) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!levelUp) return;
    setKey(k => k + 1);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [levelUp]);

  if (!levelUp || !visible) return null;

  return (
    <div key={key} className="lu-popup">
      <div className="lu-glow" />
      <div className="lu-icon"><Star size={22} /></div>
      <div className="lu-body">
        <div className="lu-eyebrow">Level Up!</div>
        <div className="lu-level">Level {levelUp.level}</div>
        <div className="lu-name">{levelUp.name}</div>
      </div>
    </div>
  );
}
