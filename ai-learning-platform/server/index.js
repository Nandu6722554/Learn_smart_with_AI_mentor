require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Log key status on startup
const key = process.env.GROQ_API_KEY;
console.log("GROQ_API_KEY:", key ? `loaded (${key.slice(0, 8)}...)` : "MISSING ⚠️");

// Routes
app.use("/api", require("./routes/learn"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Server error", details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
