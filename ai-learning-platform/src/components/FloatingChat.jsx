import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minimize2 } from "lucide-react";
import axios from "axios";
import { getMemory, buildMemoryContext } from "../store/../lib/memory";

const BASE = "http://localhost:5000/api";

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
  const prompt = `
You are an expert AI tutor helping a student learn "${topic}".
The student is currently on the "${section}" section.${memCtx}
Student question: "${question}"

Instructions:
- Answer in context of "${topic}" and the "${section}" section
- If the student has weak areas, address them proactively
- Be conversational and supportive
- Use analogy first, then technical explanation

Return ONLY valid JSON:
{"answer": "", "simple_explanation": "", "example": ""}`;
  const res = await axios.post(`${BASE}/doubt`, { topic, question: prompt });
  return res.data;
}

export default function FloatingChat({ topic, section = "Intuition" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (topic) {
      setMessages([{
        role: "ai",
        text: `Hi! I'm your AI tutor for "${topic}". You're on the ${section} section — ask me anything! 👇`
      }]);
    }
  }, [topic]);

  // Update context hint when section changes
  useEffect(() => {
    if (topic && messages.length > 0) {
      setMessages(p => [...p, {
        role: "ai",
        text: `📍 You moved to the ${section} section. Ask me anything about it!`
      }]);
    }
  }, [section]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
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
    } finally {
      setLoading(false);
    }
  };

  const suggestions = SECTION_SUGGESTIONS[section] || SECTION_SUGGESTIONS["Intuition"];

  return (
    <div className="float-chat-root">
      <div className={`float-chat-panel ${open ? "open" : ""}`}>
        <div className="float-chat-header">
          <div className="float-chat-title">
            <div className="float-chat-avatar"><Bot size={15} /></div>
            <div>
              <div className="float-chat-name">AI Tutor</div>
              <div className="float-chat-topic">{section} · {topic || "No topic"}</div>
            </div>
          </div>
          <div className="float-chat-header-btns">
            <button className="float-icon-btn" onClick={() => setOpen(false)}><Minimize2 size={14} /></button>
            <button className="float-icon-btn" onClick={() => setOpen(false)}><X size={14} /></button>
          </div>
        </div>

        <div className="float-chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`float-chat-row ${m.role}`}>
              {m.role === "ai" && <div className="float-avatar ai"><Bot size={12} /></div>}
              <div className={`float-bubble ${m.role}`}>
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
                ))}
              </div>
              {m.role === "user" && <div className="float-avatar user">U</div>}
            </div>
          ))}
          {loading && (
            <div className="float-chat-row ai">
              <div className="float-avatar ai"><Bot size={12} /></div>
              <div className="float-bubble ai typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="float-quick">
          {suggestions.map((q, i) => (
            <button key={i} className="float-quick-btn" onClick={() => send(q)} disabled={loading}>{q}</button>
          ))}
        </div>

        <div className="float-chat-input-row">
          <textarea
            className="float-chat-input"
            placeholder={`Ask about ${section}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            disabled={loading}
          />
          <button className="float-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
            <Send size={15} />
          </button>
        </div>
      </div>

      <button className={`float-fab ${open ? "active" : ""}`} onClick={() => setOpen(o => !o)} title="Ask AI Tutor">
        {open ? <X size={22} /> : <Bot size={22} />}
        {!open && <span className="float-fab-pulse" />}
      </button>
    </div>
  );
}
