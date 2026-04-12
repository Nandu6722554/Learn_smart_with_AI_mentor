import { useState } from "react";
import { ChevronRight, Clock, Target, Briefcase } from "lucide-react";
import Loader from "../components/Loader";

const TYPE_COLOR = { theory: "#a78bfa", practice: "#10b981", project: "#f59e0b" };

export default function RoadmapPage({ data, loading, onTopicSelect }) {
  const [expanded, setExpanded] = useState(0);

  if (loading) return <Loader text="Building your learning roadmap..." />;
  if (!data) return (
    <div className="page-empty">
      <div className="page-empty-icon">🗺️</div>
      <h3>No roadmap yet</h3>
      <p>Enter a topic and click Generate to build your learning path.</p>
    </div>
  );

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <h2>{data.title}</h2>
        <p>{data.overview}</p>
        <div className="roadmap-meta">
          {data.estimated_time && <span><Clock size={14} /> {data.estimated_time}</span>}
          {data.career_paths?.length > 0 && (
            <span><Briefcase size={14} /> {data.career_paths.slice(0, 2).join(", ")}</span>
          )}
        </div>
      </div>

      {/* Phase timeline */}
      <div className="roadmap-timeline">
        {data.phases?.map((phase, i) => (
          <div key={i} className={`roadmap-phase ${expanded === i ? "open" : ""}`}>
            <button className="phase-header" onClick={() => setExpanded(expanded === i ? -1 : i)}>
              <div className="phase-num" style={{ background: TYPE_COLOR[phase.resources_type] || "#a78bfa" }}>
                {phase.phase}
              </div>
              <div className="phase-info">
                <h4>{phase.title}</h4>
                <p>{phase.description}</p>
              </div>
              <span className="phase-type" style={{ color: TYPE_COLOR[phase.resources_type] || "#a78bfa" }}>
                {phase.resources_type}
              </span>
              <ChevronRight size={16} className={`phase-chevron ${expanded === i ? "rotated" : ""}`} />
            </button>

            {expanded === i && (
              <div className="phase-body">
                <div className="phase-topics">
                  {phase.topics?.map((t, j) => (
                    <button key={j} className="phase-topic-chip" onClick={() => onTopicSelect?.(t)}>
                      {t} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
                {phase.outcome && (
                  <div className="phase-outcome">
                    <Target size={13} /> <strong>Outcome:</strong> {phase.outcome}
                  </div>
                )}
              </div>
            )}

            {i < data.phases.length - 1 && <div className="phase-connector" />}
          </div>
        ))}
      </div>

      {data.final_project && (
        <div className="roadmap-project">
          <h4>🏆 Final Project</h4>
          <p>{data.final_project}</p>
        </div>
      )}
    </div>
  );
}
