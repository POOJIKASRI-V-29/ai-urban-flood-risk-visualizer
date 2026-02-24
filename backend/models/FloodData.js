const mongoose = require("mongoose");

const floodSchema = new mongoose.Schema({
  rainfall: Number,
  drainage: Number,
  elevation: Number,
  riskScore: Number,
  level: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Flood", floodSchema);
