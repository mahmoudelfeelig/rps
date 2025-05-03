const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
const app = express();

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const groupRoutes = require("./routes/group");
const betRoutes = require("./routes/bet");
const taskRoutes = require("./routes/tasks");
const achievementRoutes = require("./routes/achievements");
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const storeRoutes = require('./routes/store');


dotenv.config();

// Middleware
app.use(cors({
  origin: "*",
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
 }));
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rps", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start server after successful DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB fails
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/bets", betRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/achievements", achievementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/store', storeRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get("/", (req, res) => {
  res.send("📡 RPS API is live");
});
