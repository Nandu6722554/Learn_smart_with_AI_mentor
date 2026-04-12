import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import axios from "axios";
import { getMemory, buildMemoryContext } from "../lib/memory";

// Use same env var as the rest of the app — BASE already includes /api
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SECTION_SUGGESTIONS = {
  "Intuition":     ["Explain simpler", "Give a real-world example", "Why does this matter?"],
  "Core Concepts": ["Explain simpler", "Give another example", "Test me on this"],
  "Subtopics":     ["Explain this subtopic simpler", "Show me code", "Test me"],
  "Practice":      ["Give a hint", "Explain the approach", "Show similar example"],
  "Quiz":          ["Explain this concept", "What are common mistakes?", "Summarize this topic"],
};

async function askContextualDoubt(topic, section, question) {
  const mem = getMemory();
  const memCtx = buildMemoryContext(mem);
  const prompt = `You are an expert AI tutor helping a student learn "${topic}".
The student is currently on the "${section}" section.${memCtx}
Student question: "${question}"
Instructions: Answer in context of "${topic}" and the "${section}" section. Be conversational and supportive. Use analogy first, then technical explanation.
Return ONLY valid JSON: {"answer": "", "simple_explanation": "", "example": ""}`;
  const res = await axios.post(`${BASE}/doubt`, { topic, question: prompt });
  return res.data;
}

export default function FloatingChat({ topic, section = "Intuition" }) {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [badge, setBadge]     = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const bottomRef = useRef(null);
  const inactivityRef = useRef(null);

  // Welcome message when topic changes
  useEffect(() => {
    if (topic) {
      setMessages([{
        role: "ai",
        text: `Hi! I'm your AI Tutor for "${topic}". You're on the ${section} section — ask me anything!`
      }]);
    }
  }, [topic]);

  // Section change hint
  useEffect(() => {
    if (topic && messages.length > 0) {
      setMessages(p => [...p, {
        role: "ai",
        text: `📍 You moved to the ${section} section. Ask me anything about it!`
      }]);
    }
  }, [section]); // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  // Inactivity badge — show after 90s of no interaction
  useEffect(() => {
    if (open) { setBadge(false); return; }
    clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      if (!open) setBadge(true);
    }, 90000);
    return () => clearTimeout(inactivityRef.current);
  }, [open, messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setBadge(false);
    setMessages(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    try {
      const d = await askContextualDoubt(topic || "this topic", section, q);
      let reply = d.answer || "";
      if (d.simple_explanation) reply += `\n\n💡 ${d.simple_explanation}`;
      if (d.example) reply += `\n\n📌 ${d.example}`;
      setMessages(p => [...p, { role: "ai", text: reply }]);
    } catch {
      setMessages(p => [...p, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  const suggestions = SECTION_SUGGESTIONS[section] || SECTION_SUGGESTIONS["Intuition"];

  return (
    <div className="fc-root">

      {/* ── Chat panel ─────────────────────────────────── */}
      {open && (
        <div className="fc-panel">
          {/* Header */}
          <div className="fc-header">
            <div className="fc-header-left">
              <div className="fc-avatar-wrap">
                <div className="fc-avatar"><Bot size={16} /></div>
                <span className="fc-online-dot" />
              </div>
              <div>
                <div className="fc-name">AI Tutor</div>
                <div className="fc-context">{section} · {topic || "General"}</div>
              </div>
            </div>
            <button className="fc-close-btn" onClick={() => setOpen(false)}>
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="fc-messages">
            {messages.map((m, i) => (
              <div key={i} className={`fc-row ${m.role}`}>
                {m.role === "ai" && <div className="fc-msg-avatar ai"><Bot size={12} /></div>}
                <div className={`fc-bubble ${m.role}`}>
                  {m.text.split("\n").map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                  ))}
                </div>
                {m.role === "user" && <div className="fc-msg-avatar user">U</div>}
              </div>
            ))}
            {loading && (
              <div className="fc-row ai">
                <div className="fc-msg-avatar ai"><Bot size={12} /></div>
                <div className="fc-bubble ai fc-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="fc-suggestions">
            {suggestions.map((q, i) => (
              <button key={i} className="fc-suggestion-chip" onClick={() => send(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="fc-input-row">
            <textarea
              className="fc-input"
              placeholder={`Ask about ${topic || "anything"}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
              disabled={loading}
            />
            <button className="fc-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Tooltip ────────────────────────────────────── */}
      {showTooltip && !open && (
        <div className="fc-tooltip">
          {badge ? "Have a doubt? Ask instantly!" : "Ask AI Tutor"}
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────── */}
      <button
        className={`fc-fab ${open ? "fc-fab-open" : ""}`}
        onClick={() => { setOpen(o => !o); setBadge(false); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Ask AI Tutor"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && badge && <span className="fc-badge" />}
        {!open && <span className="fc-pulse" />}
      </button>
    </div>
  );
}
