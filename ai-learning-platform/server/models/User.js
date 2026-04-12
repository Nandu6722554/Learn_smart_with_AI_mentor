const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  xp:       { type: Number, default: 0 },
  streak:   { type: Number, default: 1 },
  lastActive: { type: Date, default: Date.now },
  topics: [{
    topic:     String,
    level:     String,
    learnedAt: { type: Date, default: Date.now },
  }],
  quizHistory: [{
    topic:  String,
    score:  Number,
    total:  Number,
    pct:    Number,
    date:   { type: Date, default: Date.now },
  }],
  weakAreas:     [String],
  practiceCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
