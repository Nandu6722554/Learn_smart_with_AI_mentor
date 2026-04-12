/* ── Session Memory ─────────────────────────────────────
   Tracks last visited module, topic, mode, and step
   so the user can resume exactly where they left off.
   ──────────────────────────────────────────────────── */
const KEY = "mentorai_session";

export function saveSession({ topic, mode, step, page, level }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      topic, mode, step, page, level,
      savedAt: Date.now(),
    }));
  } catch {}
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

/* Human-readable module label */
export function moduleLabel(mode, page) {
  if (page === "quiz")       return "Quiz";
  if (page === "playground") return "Practice";
  if (mode === "interview")  return "Interview Prep";
  if (mode === "practice")   return "Practice";
  if (mode === "roadmap")    return "Roadmap";
  return "Learn";
}
