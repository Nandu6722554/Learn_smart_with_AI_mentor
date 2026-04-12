import { useState } from "react";
import { fetchELI10, fetchRevision, fetchDoubt } from "../api";
import Loader from "./Loader";

export default function RevisionTab({ topic }) {
  const [mode, setMode] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doubt, setDoubt] = useState("");
  const [answer, setAnswer] = useState(null);

  const load = async (m) => {
    setMode(m);
    setData(null);
    setAnswer(null);
    setLoading(true);
    try {
      if (m === "eli10") {
        const r = await fetchELI10(topic);
        setData(r.data);
      } else if (m === "revision") {
        const r = await fetchRevision(topic);
        setData(r.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const askDoubt = async () => {
    if (!doubt.trim()) return;
    setLoading(true);
    try {
      const r = await fetchDoubt(topic, doubt);
      setAnswer(r.data.answer);
    } finally {
      setLoading(false);
    }
  };

  if (!topic) return <p className="placeholder">Generate a topic first to use extra learning modes.</p>;

  return (
    <div className="revision-tab">
      <div className="mode-btns">
        <button className={mode === "eli10" ? "active" : ""} onClick={() => load("eli10")}>🧒 Explain Like I'm 10</button>
        <button className={mode === "revision" ? "active" : ""} onClick={() => load("revision")}>⚡ Quick Revision</button>
        <button className={mode === "doubt" ? "active" : ""} onClick={() => setMode("doubt")}>💬 Ask a Doubt</button>
      </div>

      {loading && <Loader />}

      {!loading && mode === "eli10" && data && (
        <div className="story-box">
          <p>{data.story_explanation}</p>
        </div>
      )}

      {!loading && mode === "revision" && data && (
        <div className="revision-box">
          <p><strong>Definition:</strong> {data.definition}</p>
          <ul>{data.key_points?.map((k, i) => <li key={i}>{k}</li>)}</ul>
          <p><strong>Example:</strong> {data.example}</p>
        </div>
      )}

      {mode === "doubt" && (
        <div className="doubt-box">
          <textarea
            placeholder={`Ask anything about "${topic}"...`}
            value={doubt}
            onChange={(e) => setDoubt(e.target.value)}
            rows={3}
          />
          <button onClick={askDoubt} disabled={loading}>Ask</button>
          {!loading && answer && <div className="answer-box"><p>{answer}</p></div>}
        </div>
      )}
    </div>
  );
}
