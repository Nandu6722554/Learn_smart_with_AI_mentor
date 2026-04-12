import { useState } from "react";
import { ArrowRight, Sparkles, Zap, Link } from "lucide-react";
import { fetchNextSteps } from "../api";

export default function NextSteps({ topic, level, weakAreas, onTopicSelect }) {
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchNextSteps(topic, level, weakAreas);
      setSteps(r.data.steps);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="next-steps-wrap">
      <div className="next-steps-header">
        <div>
          <h4><Sparkles size={16} /> What to Learn Next</h4>
          <p>Personalized recommendations based on your progress</p>
        </div>
        {!steps && (
          <button className="tutor-btn" onClick={load} disabled={loading}>
            {loading ? <><span className="tutor-spinner" /> Loading...</> : "Get Suggestions"}
          </button>
        )}
        {steps && (
          <button className="tutor-btn" onClick={load} disabled={loading}>
            <ArrowRight size={12} /> Refresh
          </button>
        )}
      </div>

      {steps && (
        <div className="next-steps-grid">
          {steps.map((s, i) => (
            <button key={i} className="next-step-card" onClick={() => onTopicSelect?.(s.topic)}>
              <div className="next-step-top">
                <span className="next-step-num">{String(i + 1).padStart(2, "0")}</span>
                <ArrowRight size={16} className="next-step-arrow" />
              </div>
              <p className="next-step-topic">{s.topic}</p>
              <p className="next-step-reason">{s.reason}</p>
              {s.connection && (
                <p className="next-step-connection">
                  <Link size={11} /> {s.connection}
                </p>
              )}
              {s.skill_unlocked && (
                <p className="next-step-skill">
                  <Zap size={11} /> {s.skill_unlocked}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
