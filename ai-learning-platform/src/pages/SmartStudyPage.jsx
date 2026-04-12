import { useState, useRef, useEffect } from "react";
import { GraduationCap, Send, RotateCcw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fetchStudyChat } from "../api";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "Data Structures", "Machine Learning",
  "Web Development", "Python", "JavaScript",
  "History", "Economics", "English Grammar",
];

const LEVELS = ["beginner", "intermediate", "advanced"];

const STUDY_KEY = "mentorai_study_sessions";

function saveSession(subject, level, messages) {
  const sessions = JSON.parse(localStorage.getItem(STUDY_KEY) || "{}");
  sessions[`${subject}_${level}`] = { subject, level, messages, updatedAt: Date.now() };
  localStorage.setItem(STUDY_KEY, JSON.stringify(sessions));
}

function loadSession(subject, level) {
  const sessions = JSON.parse(localStorage.getItem(STUDY_KEY) || "{}");
  return sessions[`${subject}_${level}`]?.messages || null;
}

function QuizCard({ quiz, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handle = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    onAnswer(opt === quiz.correct, opt);
  };

  return (
    <div className="study-quiz-card">
      <p className="study-quiz-q">🧪 {quiz.question}</p>
      <div className="study-quiz-options">
        {Object.entries(quiz.options).map(([key, val]) => {
          let cls = "study-quiz-opt";
          if (revealed) {
            if (key === quiz.correct) cls += " correct";
            else if (key === selected) cls += " wrong";
          } else if (key === selected) cls += " selected";
          return (
            <button key={key} className={cls} onClick={() => handle(key)}>
              <span className="study-quiz-key">{key}</span> {val}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="study-quiz-explanation">
          {selected === quiz.correct ? "✅ Correct! " : "❌ Not quite. "}
          {quiz.explanation}
        </div>
      )}
    </div>
  );
}

function Message({ msg, onQuizAnswer }) {
  const isAI = msg.role === "ai";
  const adj = msg.data?.difficulty_adjustment;

  return (
    <div className={`study-msg-row ${isAI ? "ai" : "user"}`}>
      {isAI && <div className="study-msg-avatar"><GraduationCap size={14} /></div>}
      <div className={`study-msg-bubble ${isAI ? "ai" : "user"}`}>
        {isAI && adj && adj !== "same" && (
          <div className={`study-adj ${adj}`}>
            {adj === "increase" ? <><TrendingUp size={12} /> Increasing difficulty</> : <><TrendingDown size={12} /> Simplifying</>}
          </div>
        )}
        <p>{msg.text}</p>
        {isAI && msg.data?.quiz && (
          <QuizCard quiz={msg.data.quiz} onAnswer={(correct, opt) => onQuizAnswer(correct, opt, msg.data.quiz)} />
        )}
      </div>
      {!isAI && <div className="study-msg-avatar user">U</div>}
    </div>
  );
}

export default function SmartStudyPage() {
  const [subject, setSubject] = useState("Computer Science");
  const [level, setLevel]     = useState("beginner");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState([]); // for context window
  const bottomRef = useRef(null);

  useEffect(() => {
    if (started) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, started]);

  const startSession = () => {
    const saved = loadSession(subject, level);
    if (saved?.length) {
      setMessages(saved);
      // rebuild api history from saved
      const hist = saved.flatMap(m => m.role === "user"
        ? [{ role: "user", content: m.text }]
        : [{ role: "assistant", content: m.text }]
      );
      setApiHistory(hist);
    } else {
      setMessages([]);
      setApiHistory([]);
      // kick off with first message
      sendMessage("Hello! I'm ready to start learning.", true);
    }
    setStarted(true);
  };

  const sendMessage = async (text, isInit = false) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    if (!isInit) setInput("");

    const userMsg = { role: "user", text: q };
    const newMessages = isInit ? [userMsg] : [...messages, userMsg];
    setMessages(newMessages);

    const newHistory = [...apiHistory, { role: "user", content: q }];
    setLoading(true);

    try {
      const r = await fetchStudyChat(subject, level, apiHistory, q);
      const d = r.data;
      const aiMsg = { role: "ai", text: d.message, data: d };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      setApiHistory([...newHistory, { role: "assistant", content: d.message }]);
      saveSession(subject, level, finalMessages);
    } catch {
      setMessages(p => [...p, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (correct, opt, quiz) => {
    const feedback = correct
      ? "Great job! I got it right ✅"
      : `I chose ${opt} but the answer was ${quiz.correct}`;
    sendMessage(feedback);
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setApiHistory([]);
    setInput("");
  };

  if (!started) {
    return (
      <div className="smart-study-setup">
        <div className="smart-study-setup-card">
          <div className="smart-study-icon"><GraduationCap size={32} /></div>
          <h2>Smart Study Mode</h2>
          <p>Your AI teacher will explain concepts step-by-step, ask questions, and adapt to your level.</p>

          <div className="smart-study-fields">
            <div className="smart-study-field">
              <label>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="smart-study-select">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="smart-study-field">
              <label>Difficulty Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="smart-study-select">
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <button className="generate-btn smart-study-start" onClick={startSession}>
            <GraduationCap size={18} /> Start Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-study-page">
      <div className="smart-study-header">
        <div className="smart-study-header-info">
          <GraduationCap size={18} />
          <span><strong>{subject}</strong> · {level}</span>
        </div>
        <button className="smart-study-reset" onClick={reset}>
          <RotateCcw size={14} /> New Session
        </button>
      </div>

      <div className="smart-study-messages">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} onQuizAnswer={handleQuizAnswer} />
        ))}
        {loading && (
          <div className="study-msg-row ai">
            <div className="study-msg-avatar"><GraduationCap size={14} /></div>
            <div className="study-msg-bubble ai typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="smart-study-input-row"
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
      >
        <input
          className="smart-study-input"
          placeholder="Type your answer or ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <button type="submit" className="smart-study-send" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
