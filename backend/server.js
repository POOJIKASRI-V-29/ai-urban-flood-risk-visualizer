const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/predict", (req, res) => {
  const { rainfall, city } = req.body;

  // Hardcoded elevation values (prototype level)
  const elevations = {
    Chennai: 20,
    Mumbai: 15,
    Bangalore: 900,
  };

  const elevation = elevations[city];

  // Weighted AI risk scoring formula
  const riskScore = (rainfall * 0.6) + ((100 - elevation) * 0.4);

  let risk;

  if (riskScore > 200) {
    risk = "High";
  } else if (riskScore > 100) {
    risk = "Medium";
  } else {
    risk = "Low";
  }

  res.json({
    risk: risk,
    score: riskScore,
    elevation: elevation
  });
});

// IMPORTANT: use 3001 (since 5000 was blocked)
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
