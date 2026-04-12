import { Lock, Zap } from "lucide-react";
import { getRemainingUsage, PLANS } from "../lib/subscription";

export default function UsageGate({ type, onUpgrade, children }) {
  const remaining = getRemainingUsage(type);
  const limit = PLANS.free.limits[type];

  if (remaining === Infinity) return children; // Pro user

  return (
    <div className="usage-gate-wrap">
      {children}
      <div className={`usage-indicator ${remaining === 0 ? "exhausted" : remaining <= 1 ? "warning" : ""}`}>
        {remaining === 0 ? (
          <div className="usage-blocked">
            <Lock size={14} />
            <span>Daily limit reached ({limit}/{limit} used)</span>
            <button className="usage-upgrade-btn" onClick={onUpgrade}>
              <Zap size={13} /> Upgrade to Pro
            </button>
          </div>
        ) : (
          <span className="usage-remaining">
            {remaining}/{limit} remaining today
            {remaining <= 1 && <button className="usage-upgrade-btn small" onClick={onUpgrade}><Zap size={11} /> Go Pro</button>}
          </span>
        )}
      </div>
    </div>
  );
}
