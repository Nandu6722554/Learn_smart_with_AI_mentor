import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("[MentorAI] API base URL:", BASE);

// Axios interceptors for debug logging
axios.interceptors.request.use(req => {
  console.log(`[API →] ${req.method?.toUpperCase()} ${req.url}`, req.data || "");
  return req;
});
axios.interceptors.response.use(
  res => { console.log(`[API ←] ${res.status} ${res.config.url}`, res.data); return res; },
  err => { console.error(`[API ✗] ${err.config?.url}`, err.response?.data || err.message); return Promise.reject(err); }
);

export const fetchLearn      = (topic, level) => axios.post(`${BASE}/learn`, { topic, level });
export const fetchGenerateAll = (topic, level) => axios.post(`${BASE}/generate-all`, { topic, level });
export const fetchQuiz       = (topic, level) => axios.post(`${BASE}/quiz`, { topic, level });
export const fetchPlayground = (topic, level) => axios.post(`${BASE}/playground`, { topic, level });
export const fetchELI10      = (topic) => axios.post(`${BASE}/eli10`, { topic });
export const fetchRevision   = (topic) => axios.post(`${BASE}/revision`, { topic });
export const fetchDoubt      = (topic, question) => axios.post(`${BASE}/doubt`, { topic, question });
export const fetchTutorAction = (topic, concept, action) => axios.post(`${BASE}/tutor-action`, { topic, concept, action });
export const fetchSelfCheck  = (topic, level) => axios.post(`${BASE}/selfcheck`, { topic, level });
export const fetchTryYourself = (topic, subtopic) => axios.post(`${BASE}/try-yourself`, { topic, subtopic });
export const fetchNextSteps  = (topic, level, weakAreas) => axios.post(`${BASE}/next-steps`, { topic, level, weakAreas });
export const fetchAutoPractice = (topic, level) => axios.post(`${BASE}/auto-practice`, { topic, level });
export const fetchSearchAnswer  = (query) => axios.post(`${BASE}/search-answer`, { query });
export const fetchDetectIntent  = (query) => axios.post(`${BASE}/detect-intent`, { query });
export const fetchStudyChat     = (subject, level, history, userMessage) => axios.post(`${BASE}/study-chat`, { subject, level, history, userMessage });
export const fetchGoalRoadmap   = (goal, level, weeks) => axios.post(`${BASE}/goal-roadmap`, { goal, level, weeks });
export const fetchDailyPlan     = (goal, level) => axios.post(`${BASE}/daily-plan`, { goal, level });
export const fetchRoadmapOverview = (goal, level) => axios.post(`${BASE}/roadmap-overview`, { goal, level });
export const fetchMockInterview = (domain, difficulty, history, userAnswer, questionNumber) =>
  axios.post(`${BASE}/mock-interview`, { domain, difficulty, history, userAnswer, questionNumber });
export const fetchRoadmap   = (topic, level) => axios.post(`${BASE}/roadmap`, { topic, level });
export const fetchInterview = (topic, level, count, difficulty) => axios.post(`${BASE}/interview`, { topic, level, count, difficulty });
export const fetchCheckAnswer = (topic, task, userAnswer) => axios.post(`${BASE}/check-answer`, { topic, task, userAnswer });

// Auth
export const apiSignup = (name, email, password) => axios.post(`${BASE}/auth/signup`, { name, email, password });
export const apiLogin  = (email, password) => axios.post(`${BASE}/auth/login`, { email, password });
export const apiMe     = (token) => axios.get(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });

// Progress persistence
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
export const saveTopic    = (topic, level, xpEarned) => axios.post(`${BASE}/progress/topic`, { topic, level, xpEarned }, authHeader());
export const saveQuiz     = (topic, score, total, weakAreas) => axios.post(`${BASE}/progress/quiz`, { topic, score, total, weakAreas }, authHeader());
export const savePractice = () => axios.post(`${BASE}/progress/practice`, {}, authHeader());
