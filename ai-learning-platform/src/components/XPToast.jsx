import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

/* ── Floating XP gain popup — animated ─────────────────── */
export default function XPToast({ xpGain }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!xpGain) return;
    const id = Date.now();
    setItems(prev => [...prev, { ...xpGain, id }]);
    const t = setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
    }, 2600);
    return () => clearTimeout(t);
  }, [xpGain]);

  return (
    <div className="xp-toast-stack">
      {items.map((item, idx) => (
        <div key={item.id} className="xp-toast-popup" style={{ bottom: `${5 + idx * 3.5}rem` }}>
          <div className="xp-toast-icon"><Zap size={14} /></div>
          <div className="xp-toast-content">
            <span className="xp-toast-amount">+{item.amount} XP</span>
            {item.label && <span className="xp-toast-label">{item.label}</span>}
          </div>
          <div className="xp-toast-bar" />
        </div>
      ))}
    </div>
  );
}
