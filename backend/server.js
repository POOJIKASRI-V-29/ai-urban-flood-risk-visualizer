const express   = require("express");
const cors      = require("cors");
const mongoose  = require("mongoose");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MongoDB Connection ────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/urban-flood";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected:", MONGO_URI))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

// ─── Schema & Model ────────────────────────────────────────────────────────
const analysisSchema = new mongoose.Schema({
  city:      { type: String, required: true },
  rainfall:  { type: Number, required: true },  // mm
  drainage:  { type: Number, required: true },  // %
  elevation: { type: Number, required: true },  // %
  score:     { type: Number, required: true },  // 0-100
  level:     { type: String, enum: ["LOW", "MODERATE", "HIGH"], required: true },
  factors:   [String],
  createdAt: { type: Date, default: Date.now },
});

const Analysis = mongoose.model("Analysis", analysisSchema);

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ─── Risk Calculation Logic ───────────────────────────────────────────────
function analyzeFloodRisk({ rainfall, drainage, elevation }) {
  const rainfallScore  = (rainfall / 300) * 50;
  const drainageScore  = ((100 - drainage) / 100) * 30;
  const elevationScore = ((100 - elevation) / 100) * 20;

  const score = Math.min(98, Math.round(rainfallScore + drainageScore + elevationScore));
  const level = score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";

  const factors = [];
  if (rainfall > 100) factors.push("High Rainfall");
  if (drainage < 50)  factors.push("Poor Drainage");
  if (elevation < 50) factors.push("Low Elevation");

  return { score, level, factors };
}

// ─── Routes ───────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Urban Flood Risk API ✅",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// POST /api/analyze — analyze + save to MongoDB
app.post("/api/analyze", async (req, res) => {
  const { city, rainfall, drainage, elevation } = req.body;

  if (!city || rainfall === undefined || drainage === undefined || elevation === undefined) {
    return res.status(400).json({ error: "Missing required fields: city, rainfall, drainage, elevation" });
  }

  const result = analyzeFloodRisk({ rainfall, drainage, elevation });

  try {
    const record = await Analysis.create({
      city, rainfall, drainage, elevation,
      score: result.score,
      level: result.level,
      factors: result.factors,
    });

    console.log(`[Saved] City: ${city} | Score: ${result.score} | Level: ${result.level} | ID: ${record._id}`);

    res.json({
      id: record._id,
      city,
      ...result,
      savedToDb: true,
      timestamp: record.createdAt,
    });
  } catch (err) {
    console.error("DB save error:", err.message);
    res.json({ city, ...result, savedToDb: false, error: "DB save failed" });
  }
});

// GET /api/history — fetch last 20 analyses
app.get("/api/history", async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city } : {};
    const records = await Analysis.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// GET /api/history/:city — history for one city
app.get("/api/history/:city", async (req, res) => {
  try {
    const records = await Analysis.find({ city: req.params.city })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch city history" });
  }
});

// DELETE /api/history — clear all (for testing)
app.delete("/api/history", async (req, res) => {
  try {
    await Analysis.deleteMany({});
    res.json({ message: "All records deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete records" });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌊 Flood Risk API running at http://localhost:${PORT}`);
});