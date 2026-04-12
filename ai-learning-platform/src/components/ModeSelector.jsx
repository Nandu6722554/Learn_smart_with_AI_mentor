import { BookOpen, Map, Dumbbell, Briefcase } from "lucide-react";

export const MODES = [
  { id: "learn",     label: "Learn",     icon: BookOpen,  desc: "Understand concepts deeply",     color: "#a78bfa" },
  { id: "roadmap",   label: "Roadmap",   icon: Map,       desc: "Structured learning path",        color: "#38bdf8" },
  { id: "practice",  label: "Practice",  icon: Dumbbell,  desc: "Hands-on skill building",         color: "#10b981" },
  { id: "interview", label: "Interview", icon: Briefcase, desc: "Job interview preparation",        color: "#f59e0b" },
];

export default function ModeSelector({ mode, setMode, disabled }) {
  return (
    <div className="mode-selector">
      {MODES.map(({ id, label, icon: Icon, desc, color }) => (
        <button
          key={id}
          className={`mode-btn ${mode === id ? "active" : ""}`}
          onClick={() => setMode(id)}
          disabled={disabled}
          style={mode === id ? { borderColor: color, color } : {}}
          title={desc}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
