const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  remainingWashes: Number,
  remainingInteriors: Number,
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  }
});

module.exports = mongoose.model("Package", packageSchema);
