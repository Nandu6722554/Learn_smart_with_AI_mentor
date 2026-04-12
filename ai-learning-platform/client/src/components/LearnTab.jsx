import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="section">
      <button className="section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

export default function LearnTab({ data }) {
  if (!data) return <p className="placeholder">Enter a topic and click Generate to start learning.</p>;

  return (
    <div className="learn-tab">
      <div className="learn-header">
        <h2>{data.title}</h2>
        <span className={`badge badge-${data.difficulty}`}>{data.difficulty}</span>
      </div>

      <Section title="📖 Definition">
        <p>{data.definition}</p>
      </Section>

      <Section title="🌍 Real World Example">
        <p>{data.real_world_example}</p>
      </Section>

      <Section title="💡 Intuitive Explanation">
        <p>{data.intuitive_explanation}</p>
      </Section>

      <Section title="🪜 Step-by-Step Breakdown">
        <ol>
          {data.step_by_step?.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </Section>

      <Section title="🔑 Key Points">
        <ul>
          {data.key_points?.map((k, i) => <li key={i}>{k}</li>)}
        </ul>
      </Section>

      <Section title="🚀 Applications">
        <ul>
          {data.applications?.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </Section>

      <Section title="⚠️ Common Mistakes">
        <ul>
          {data.common_mistakes?.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </Section>

      <Section title="📝 Summary">
        <p>{data.summary}</p>
      </Section>
    </div>
  );
}
