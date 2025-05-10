const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");

const runStoreSeeder = require("./seeders/storeSeeder");

const authRoutes         = require("./routes/auth");
const userRoutes         = require("./routes/user");
const betRoutes          = require("./routes/bet");
const taskRoutes         = require("./routes/tasks");
const achievementRoutes  = require("./routes/achievements");
const adminRoutes        = require("./routes/admin");
const leaderboardRoutes  = require("./routes/leaderboard");
const storeRoutes        = require("./routes/store");
const serviceRoutes      = require("./routes/service");
const tradeRoutes        = require("./routes/trades");

const gamesRoutes        = require("./routes/games");
const minefieldRoutes    = require("./routes/minefield");

const crittersRoutes     = require("./routes/critters");
const sanctuaryRoutes    = require("./routes/sanctuary");
const cosmeticsRoutes    = require("./routes/cosmetics");
const gachaRoutes        = require("./routes/gacha");
const traitsRoutes       = require("./routes/traits");
const shopRoutes         = require("./routes/shop");
const breedRoutes        = require("./routes/breeding");

dotenv.config();

const app = express();

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Middleware
    app.use(cors({
      origin: [
        "https://www.riskpaperscammers.com",
        "http://localhost:3000",
        "https://riskpaperscammers.com",
        "https://rps-n9d.pages.dev"
      ],
      methods: "GET,POST,PUT,PATCH,DELETE"
    }));
    app.use(express.json());

    // Static files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use(express.static(path.join(__dirname, 'frontend', 'public')));
    app.use(express.static("public"));

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/bets", betRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api/achievements", achievementRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/leaderboard", leaderboardRoutes);
    app.use("/api/store", storeRoutes);
    app.use("/api/services", serviceRoutes);
    app.use("/api/trades", tradeRoutes);

    // Games
    app.use("/api/games", gamesRoutes);
    app.use("/api/games/minefield", minefieldRoutes);

    // Pets
    app.use("/api/critters", crittersRoutes);
    app.use("/api/sanctuary", sanctuaryRoutes);
    app.use("/api/cosmetics", cosmeticsRoutes);
    app.use("/api/gacha", gachaRoutes);
    app.use("/api/traits", traitsRoutes);
    app.use("/api/shop", shopRoutes);
    app.use("/api/breeding", breedRoutes);

    // Root
    app.get("/", (req, res) => {
      res.send("📡 RPS API is live");
    });

    // Start passive jobs
    require("./jobs/passiveResourceJob");

    // Schedule daily store seeder at 00:00 Berlin time
    cron.schedule("0 0 * * *", async () => {
      try {
        console.log("[⏰] Running daily store seeder...");
        await runStoreSeeder();
        console.log("[✅] Store seeder completed.");
      } catch (err) {
        console.error("[❌] Store seeder failed:", err);
      }
    }, {
      timezone: "Europe/Berlin"
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

startServer();
