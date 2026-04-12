import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { fetchLearn, fetchQuiz, fetchPlayground } from "./api";
import LearnTab from "./components/LearnTab";
import QuizTab from "./components/QuizTab";
import PlaygroundTab from "./components/PlaygroundTab";
import RevisionTab from "./components/RevisionTab";
import Loader from "./components/Loader";
import "./App.css";

const TABS = ["Learn", "Playground", "Quiz", "Quick Revision"];
const LEVELS = ["basic", "intermediate", "advanced"];

export default function App() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("basic");
  const [activeTab, setActiveTab] = useState("Learn");
  const [loading, setLoading] = useState(false);
  const [learnData, setLearnData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [pgData, setPgData] = useState(null);
  const [submittedTopic, setSubmittedTopic] = useState("");

  const generate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic");
    setLoading(true);
    setLearnData(null); setQuizData(null); setPgData(null);
    try {
      const [l, q, p] = await Promise.all([
        fetchLearn(topic, level),
        fetchQuiz(topic, level),
        fetchPlayground(topic, level),
      ]);
      setLearnData(l.data);
      setQuizData(q.data);
      setPgData(p.data);
      setSubmittedTopic(topic);
      setActiveTab("Learn");
      toast.success("Module generated!");
    } catch {
      toast.error("Something went wrong. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Toaster position="top-right" />
      <header className="app-header">
        <h1>🧠 AI Learning Platform</h1>
        <p>Learn anything, at your own pace</p>
      </header>

      <div className="input-section">
        <input
          className="topic-input"
          placeholder="Enter any topic (e.g. Recursion, Photosynthesis, Gravity...)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <div className="controls">
          <div className="level-selector">
            {LEVELS.map((l) => (
              <button
                key={l}
                className={`level-btn ${level === l ? "active" : ""}`}
                onClick={() => setLevel(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="generate-btn" onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
          {learnData && (
            <button className="regen-btn" onClick={generate} disabled={loading} title="Regenerate">
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {loading && <Loader />}

      {!loading && learnData && (
        <>
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === "Learn" && <LearnTab data={learnData} />}
            {activeTab === "Playground" && <PlaygroundTab data={pgData} />}
            {activeTab === "Quiz" && <QuizTab data={quizData} />}
            {activeTab === "Quick Revision" && <RevisionTab topic={submittedTopic} />}
          </div>
        </>
      )}

      {!loading && !learnData && (
        <div className="empty-state">
          <p>✨ Type a topic above and hit Generate to start your learning journey</p>
        </div>
      )}
    </div>
  );
}
