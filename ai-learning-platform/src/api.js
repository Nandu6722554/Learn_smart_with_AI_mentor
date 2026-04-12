import axios from "axios";

/* ── Base URL ──────────────────────────────────────────────
   VITE_API_URL should be the bare backend domain:
     https://learn-smart-with-ai-mentor.onrender.com
   We always append /api here, so never include /api in the env var.
   ──────────────────────────────────────────────────────── */
const RAW = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const BASE = `${RAW}/api`;

if (import.meta.env.DEV) {
  console.log("[MentorAI] API base URL:", BASE);
}

/* ── Axios instance ──────────────────────────────────────── */
const api = axios.create({
  baseURL: BASE,
  timeout: 60000, // 60s — Render cold starts can be slow
  headers: { "Content-Type": "application/json" },
});

// Request logger (dev only)
if (import.meta.env.DEV) {
  api.interceptors.request.use(req => {
    console.log(`[API →] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`, req.data || "");
    return req;
  });
}

// Response logger + error normaliser
api.interceptors.response.use(
  res => {
    if (import.meta.env.DEV) console.log(`[API ←] ${res.status} ${res.config.url}`);
    return res;
  },
  err => {
    const url  = err.config?.url || "";
    const status = err.response?.status;
    const msg  = err.response?.data?.error || err.response?.data?.message || err.message;
    console.error(`[API ✗] ${status || "NET"} ${url} — ${msg}`);
    return Promise.reject(err);
  }
);

/* ── API helpers ─────────────────────────────────────────── */
const post = (path, data) => api.post(path, data);
const get  = (path, cfg)  => api.get(path, cfg);

/* ── Learning endpoints ──────────────────────────────────── */
export const fetchLearn         = (topic, level)         => post("/learn",           { topic, level });
export const fetchGenerateAll   = (topic, level)         => post("/generate-all",    { topic, level });
export const fetchQuiz          = (topic, level)         => post("/quiz",            { topic, level });
export const fetchPlayground    = (topic, level)         => post("/playground",      { topic, level });
export const fetchELI10         = (topic)                => post("/eli10",           { topic });
export const fetchRevision      = (topic)                => post("/revision",        { topic });
export const fetchDoubt         = (topic, question)      => post("/doubt",           { topic, question });
export const fetchTutorAction   = (topic, concept, action) => post("/tutor-action", { topic, concept, action });
export const fetchSelfCheck     = (topic, level)         => post("/selfcheck",       { topic, level });
export const fetchTryYourself   = (topic, subtopic)      => post("/try-yourself",   { topic, subtopic });
export const fetchNextSteps     = (topic, level, weakAreas) => post("/next-steps",  { topic, level, weakAreas });
export const fetchAutoPractice  = (topic, level)         => post("/auto-practice",  { topic, level });
export const fetchSearchAnswer  = (query)                => post("/search-answer",  { query });
export const fetchDetectIntent  = (query)                => post("/detect-intent",  { query });
export const fetchStudyChat     = (subject, level, history, userMessage) =>
  post("/study-chat", { subject, level, history, userMessage });
export const fetchGoalRoadmap   = (goal, level, weeks)   => post("/goal-roadmap",   { goal, level, weeks });
export const fetchDailyPlan     = (goal, level)          => post("/daily-plan",     { goal, level });
export const fetchRoadmapOverview = (goal, level)        => post("/roadmap-overview", { goal, level });
export const fetchMockInterview = (domain, difficulty, history, userAnswer, questionNumber) =>
  post("/mock-interview", { domain, difficulty, history, userAnswer, questionNumber });
export const fetchRoadmap       = (topic, level)         => post("/roadmap",        { topic, level });
export const fetchInterview     = (topic, level, count, difficulty) =>
  post("/interview", { topic, level, count, difficulty });
export const fetchCheckAnswer   = (topic, task, userAnswer) =>
  post("/check-answer", { topic, task, userAnswer });

/* ── Auth endpoints ──────────────────────────────────────── */
export const apiSignup = (name, email, password) => post("/auth/signup", { name, email, password });
export const apiLogin  = (email, password)       => post("/auth/login",  { email, password });
export const apiMe     = (token) => get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });

/* ── Progress endpoints ──────────────────────────────────── */
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
export const saveTopic    = (topic, level, xpEarned) => api.post("/progress/topic",    { topic, level, xpEarned }, authHeader());
export const saveQuiz     = (topic, score, total, weakAreas) => api.post("/progress/quiz", { topic, score, total, weakAreas }, authHeader());
export const savePractice = () => api.post("/progress/practice", {}, authHeader());

export default api;
