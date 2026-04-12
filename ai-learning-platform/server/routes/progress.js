const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// POST /api/progress/topic — save learned topic
router.post("/topic", auth, async (req, res) => {
  const { topic, level, xpEarned } = req.body;
  try {
    const user = await User.findById(req.user.id);
    // avoid duplicates — update if exists
    const idx = user.topics.findIndex(t => t.topic === topic);
    if (idx >= 0) user.topics[idx].learnedAt = new Date();
    else user.topics.unshift({ topic, level });
    if (user.topics.length > 50) user.topics = user.topics.slice(0, 50);
    user.xp += (xpEarned || 50);
    await user.save();
    res.json({ ok: true, xp: user.xp });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/progress/quiz — save quiz result
router.post("/quiz", auth, async (req, res) => {
  const { topic, score, total, weakAreas } = req.body;
  const pct = Math.round((score / total) * 100);
  try {
    const user = await User.findById(req.user.id);
    user.quizHistory.unshift({ topic, score, total, pct });
    if (user.quizHistory.length > 50) user.quizHistory = user.quizHistory.slice(0, 50);
    if (weakAreas?.length) {
      user.weakAreas = [...new Set([...weakAreas, ...user.weakAreas])].slice(0, 15);
    }
    user.xp += score * 20;
    await user.save();
    res.json({ ok: true, xp: user.xp });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/progress/practice
router.post("/practice", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.practiceCount += 1;
    user.xp += 30;
    await user.save();
    res.json({ ok: true, xp: user.xp });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
