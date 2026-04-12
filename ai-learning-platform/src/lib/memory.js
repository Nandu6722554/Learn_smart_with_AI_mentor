// Persistent user memory — survives page refresh
const KEY = "mentorai_memory";

const defaults = {
  goals: [],           // ["Learn ML", "Prepare for interviews"]
  weakAreas: [],       // ["recursion", "dynamic programming"]
  topicsLearned: [],   // [{topic, level, date, mode}]
  quizHistory: [],     // [{topic, score, total, pct, date}]
  practiceCount: 0,
  xp: 0,
  streak: 1,
  lastActiveDate: null,
  totalSessions: 0,
};

export function getMemory() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { ...defaults }; }
}

export function saveMemory(data) {
  localStorage.setItem(KEY, JSON.stringify({ ...getMemory(), ...data }));
}

export function addTopicToMemory(topic, level, mode) {
  const mem = getMemory();
  const exists = mem.topicsLearned.find(t => t.topic === topic);
  if (!exists) {
    mem.topicsLearned = [{ topic, level, mode, date: new Date().toLocaleDateString() }, ...mem.topicsLearned].slice(0, 50);
  }
  mem.xp = (mem.xp || 0) + 50;
  mem.totalSessions = (mem.totalSessions || 0) + 1;
  // streak logic
  const today = new Date().toDateString();
  if (mem.lastActiveDate !== today) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    mem.streak = mem.lastActiveDate === yesterday.toDateString() ? (mem.streak || 1) + 1 : 1;
    mem.lastActiveDate = today;
  }
  saveMemory(mem);
}

export function addWeakArea(area) {
  const mem = getMemory();
  mem.weakAreas = [...new Set([area, ...(mem.weakAreas || [])])].slice(0, 15);
  saveMemory(mem);
}

export function addQuizResult(topic, score, total) {
  const mem = getMemory();
  const pct = Math.round(score / total * 100);
  mem.quizHistory = [{ topic, score, total, pct, date: new Date().toLocaleDateString() }, ...(mem.quizHistory || [])].slice(0, 30);
  mem.xp = (mem.xp || 0) + score * 20;
  if (pct < 60) addWeakArea(topic);
  saveMemory(mem);
}

export function setGoals(goals) {
  saveMemory({ goals });
}

export function buildMemoryContext(mem) {
  const parts = [];
  if (mem.goals?.length)        parts.push(`User goals: ${mem.goals.join(", ")}`);
  if (mem.topicsLearned?.length) parts.push(`Topics learned: ${mem.topicsLearned.slice(0, 5).map(t => t.topic).join(", ")}`);
  if (mem.weakAreas?.length)    parts.push(`Weak areas: ${mem.weakAreas.slice(0, 5).join(", ")}`);
  const avgScore = mem.quizHistory?.length
    ? Math.round(mem.quizHistory.reduce((s, q) => s + q.pct, 0) / mem.quizHistory.length)
    : null;
  if (avgScore !== null) parts.push(`Average quiz score: ${avgScore}%`);
  return parts.length ? `\n\nUser context:\n${parts.join("\n")}` : "";
}
