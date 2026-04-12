import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { fetchSearchAnswer } from "../api";

const STARTERS = [
  "How do I start learning machine learning?",
  "What's the difference between SQL and NoSQL?",
  "How to prepare for a software engineering interview?",
  "Explain neural networks like I'm 10",
  "What should I learn after Python basics?",
];

export default function AskAIPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI tutor. Ask me anything — concepts, career advice, or just explore ideas. 👋" }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    try {
      const r = await fetchSearchAnswer(q);
      const d = r.data;
      let reply = d.definition ? `${d.definition}\n\n${d.explanation || ""}` : (d.answer || "");
      if (d.real_world_example) reply += `\n\n🌍 ${d.real_world_example}`;
      if (d.explore_more?.length) {
        reply += "\n\n💡 Explore more:\n" + d.explore_more.map(f => `• ${f}`).join("\n");
      }
      setMessages(p => [...p, { role: "ai", text: reply }]);
    } catch {
      setMessages(p => [...p, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-ai-page">
      <div className="ask-ai-header">
        <div className="ask-ai-avatar"><Bot size={20} /></div>
        <div>
          <h2>Ask Mentor<span className="logo-ai">AI</span></h2>
          <p>Conversational learning — ask anything</p>
        </div>
      </div>

      {/* Starters — only shown at start */}
      {messages.length === 1 && (
        <div className="ask-ai-starters">
          <p className="ask-ai-starters-label"><Sparkles size={13} /> Try asking:</p>
          <div className="ask-ai-starters-grid">
            {STARTERS.map((s, i) => (
              <button key={i} className="starter-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="ask-ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ask-ai-row ${m.role}`}>
            {m.role === "ai" && <div className="ask-ai-msg-avatar"><Bot size={14} /></div>}
            <div className={`ask-ai-bubble ${m.role}`}>
              {m.text.split("\n").map((line, j) => (
                <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
              ))}
            </div>
            {m.role === "user" && <div className="ask-ai-msg-avatar user">U</div>}
          </div>
        ))}
        {loading && (
          <div className="ask-ai-row ai">
            <div className="ask-ai-msg-avatar"><Bot size={14} /></div>
            <div className="ask-ai-bubble ai typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ask-ai-input-row">
        <textarea
          className="ask-ai-input"
          placeholder="Ask anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          disabled={loading}
        />
        <button className="ask-ai-send" onClick={() => send()} disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
