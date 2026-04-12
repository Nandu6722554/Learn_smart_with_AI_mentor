import { useState, useCallback, useEffect } from "react";

export const XP = {
  GENERATE:  50,
  QUIZ_Q:    20,
  PRACTICE:  30,
  SELFCHECK: 15,
  STREAK:    25,
};

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: "first_topic",    label: "First Step",      icon: "🎯", desc: "Learned your first topic",        check: (s) => s.recentTopics.length >= 1 },
  { id: "five_topics",    label: "Explorer",         icon: "🗺️", desc: "Learned 5 topics",               check: (s) => s.recentTopics.length >= 5 },
  { id: "streak_3",       label: "On a Roll",        icon: "🔥", desc: "3-day learning streak",           check: (s) => s.streak >= 3 },
  { id: "streak_7",       label: "Week Warrior",     icon: "⚡", desc: "7-day learning streak",           check: (s) => s.streak >= 7 },
  { id: "practice_5",     label: "Practitioner",     icon: "💪", desc: "Completed 5 practice tasks",     check: (s) => s.practiceCount >= 5 },
  { id: "quiz_perfect",   label: "Perfect Score",    icon: "🏆", desc: "Got 100% on a quiz",             check: (s) => s.quizHistory.some(q => q.pct === 100) },
  { id: "level_3",        label: "Rising Scholar",   icon: "📚", desc: "Reached Level 3",                check: (s) => s.userLevel >= 3 },
  { id: "xp_500",         label: "XP Hunter",        icon: "✨", desc: "Earned 500 XP",                  check: (s) => s.xp >= 500 },
];

const TODAY = () => new Date().toDateString();

export function useAppStore() {
  const [topic, setTopic]             = useState("");
  const [level, setLevel]             = useState("basic");
  const [activeTopic, setActiveTopic] = useState("");
  const [activeSection, setActiveSection] = useState("Intuition");
  const [recentTopics, setRecentTopics]   = useState([]);

  const [learnData, setLearnData] = useState(null);
  const [quizData, setQuizData]   = useState(null);
  const [pgData, setPgData]       = useState(null);

  const [xp, setXp]                   = useState(0);
  const [streak, setStreak]           = useState(1);
  const [lastActiveDate, setLastActiveDate] = useState(TODAY());
  const [quizHistory, setQuizHistory] = useState([]);
  const [weakAreas, setWeakAreas]     = useState([]);
  const [practiceCount, setPracticeCount] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null); // for toast

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState({
    date: TODAY(),
    learnTopic: false,
    completePractice: false,
    takeQuiz: false,
  });

  // Reset daily goals if new day
  useEffect(() => {
    if (dailyGoals.date !== TODAY()) {
      setDailyGoals({ date: TODAY(), learnTopic: false, completePractice: false, takeQuiz: false });
    }
  }, [dailyGoals.date]);

  const checkAchievements = useCallback((state) => {
    ACHIEVEMENTS.forEach(a => {
      if (!state.unlockedAchievements.includes(a.id) && a.check(state)) {
        setUnlockedAchievements(prev => [...prev, a.id]);
        setNewAchievement(a);
        setTimeout(() => setNewAchievement(null), 4000);
      }
    });
  }, []);

  const addXP = useCallback((amount) => {
    setXp(prev => prev + amount);
  }, []);

  const updateStreak = useCallback(() => {
    const today = TODAY();
    setLastActiveDate(prev => {
      if (prev === today) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = prev === yesterday.toDateString();
      setStreak(s => wasYesterday ? s + 1 : 1);
      return today;
    });
  }, []);

  const recordTopic = useCallback((t) => {
    setRecentTopics(prev => [t, ...prev.filter(x => x !== t)].slice(0, 20));
    addXP(XP.GENERATE);
    updateStreak();
    setDailyGoals(g => ({ ...g, learnTopic: true }));
  }, [addXP, updateStreak]);

  const recordQuiz = useCallback((topic, score, total, feedbackWeakAreas) => {
    const entry = { topic, score, total, date: new Date().toLocaleDateString(), pct: Math.round(score / total * 100) };
    setQuizHistory(prev => [entry, ...prev].slice(0, 30));
    if (feedbackWeakAreas?.length) setWeakAreas(prev => [...new Set([...prev, ...feedbackWeakAreas])].slice(0, 15));
    addXP(score * XP.QUIZ_Q);
    setDailyGoals(g => ({ ...g, takeQuiz: true }));
  }, [addXP]);

  const recordPractice = useCallback(() => {
    setPracticeCount(p => p + 1);
    addXP(XP.PRACTICE);
    setDailyGoals(g => ({ ...g, completePractice: true }));
  }, [addXP]);

  const userLevel = xp < 200 ? 1 : xp < 500 ? 2 : xp < 1000 ? 3 : xp < 2000 ? 4 : 5;
  const levelNames = ["", "Beginner", "Explorer", "Learner", "Scholar", "Master"];
  const nextLevelXP = [0, 200, 500, 1000, 2000, 9999];
  const xpProgress = userLevel < 5
    ? Math.round(((xp - nextLevelXP[userLevel - 1]) / (nextLevelXP[userLevel] - nextLevelXP[userLevel - 1])) * 100)
    : 100;

  const dailyGoalCount = Object.values(dailyGoals).filter(v => v === true).length;
  const avgQuizScore = quizHistory.length
    ? Math.round(quizHistory.reduce((s, q) => s + q.pct, 0) / quizHistory.length)
    : 0;

  return {
    topic, setTopic, level, setLevel,
    activeTopic, setActiveTopic,
    activeSection, setActiveSection,
    recentTopics, recordTopic,
    learnData, setLearnData,
    quizData, setQuizData,
    pgData, setPgData,
    xp, addXP, streak,
    userLevel, levelNames, xpProgress, nextLevelXP,
    quizHistory, recordQuiz, avgQuizScore,
    weakAreas,
    practiceCount, recordPractice,
    dailyGoals, dailyGoalCount,
    unlockedAchievements, newAchievement,
  };
}
