import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { fetchDoubt } from "../api";

export default function ChatSidebar({ topic }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hi! I'm your AI tutor for "${topic}". Ask me anything about this topic 👇` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!collapsed) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, collapsed]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    try {
      const r = await fetchDoubt(topic, q);
      const d = r.data;
      let text = d.answer || "";
      if (d.simple_explanation) text += `\n\n💡 ${d.simple_explanation}`;
      if (d.example) text += `\n\n📌 ${d.example}`;
      setMessages(p => [...p, { role: "ai", text }]);
    } catch {
      setMessages(p => [...p, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className={`chat-panel ${collapsed ? "collapsed" : ""}`}>

      {/* Header */}
      <div className="chat-panel-header" onClick={() => setCollapsed(c => !c)}>
        <div className="chat-panel-title">
          <div className="chat-tutor-avatar"><Bot size={16} /></div>
          <div>
            <div className="chat-tutor-name">Your AI Tutor</div>
            <div className="chat-tutor-sub">Ask anything about {topic}</div>
          </div>
        </div>
        <button className="chat-collapse-btn">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Body */}
      <div className="chat-panel-body">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-row ${m.role}`}>
              {m.role === "ai" && (
                <div className="chat-avatar-icon"><Bot size={13} /></div>
              )}
              <div className={`chat-bubble ${m.role}`}>
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
                ))}
              </div>
              {m.role === "user" && (
                <div className="chat-avatar-icon user">U</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-row ai">
              <div className="chat-avatar-icon"><Bot size={13} /></div>
              <div className="chat-bubble ai typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-panel-input">
          <textarea
            className="chat-input"
            placeholder="Ask a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
