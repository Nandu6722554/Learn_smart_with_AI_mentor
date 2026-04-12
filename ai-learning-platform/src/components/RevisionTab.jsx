import { useState, useRef, useEffect } from "react";
import { fetchELI10, fetchRevision, fetchDoubt } from "../api";
import Loader from "./Loader";
import { Send } from "lucide-react";

function ChatInterface({ topic }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hi! I'm your personal tutor for "${topic}". Ask me anything about this topic 👇` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const r = await fetchDoubt(topic, q);
      const d = r.data;
      let aiText = d.answer || "";
      if (d.simple_explanation) aiText += `\n\n💡 ${d.simple_explanation}`;
      if (d.example) aiText += `\n\n📌 Example: ${d.example}`;
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="chat-wrap">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble-row ${m.role}`}>
            {m.role === "ai" && <div className="chat-avatar">🤖</div>}
            <div className={`chat-bubble ${m.role}`}>
              {m.text.split("\n").map((line, j) => (
                <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
              ))}
            </div>
            {m.role === "user" && <div className="chat-avatar user">👤</div>}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble-row ai">
            <div className="chat-avatar">🤖</div>
            <div className="chat-bubble ai typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder={`Ask anything about "${topic}"...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={loading}
        />
        <button className="chat-send-btn" onClick={send} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default function RevisionTab({ topic }) {
  const [mode, setMode] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (m) => {
    setMode(m); setData(null); setLoading(true);
    try {
      if (m === "eli10") { const r = await fetchELI10(topic); setData(r.data); }
      else if (m === "revision") { const r = await fetchRevision(topic); setData(r.data); }
    } finally { setLoading(false); }
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
        <div className="story-box"><p>{data.story}</p></div>
      )}

      {!loading && mode === "revision" && data && (
        <div className="revision-box">
          <p><strong>Definition:</strong> {data.definition}</p>
          {data.formula_or_core_rule && (
            <p className="formula-box"><strong>Core Rule:</strong> {data.formula_or_core_rule}</p>
          )}
          <ul>{data.key_points?.map((k, i) => <li key={i}>{k}</li>)}</ul>
          <p><strong>Example:</strong> {data.example}</p>
        </div>
      )}

      {mode === "doubt" && <ChatInterface topic={topic} />}
    </div>
  );
}
