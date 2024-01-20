const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: String,
  totalWashes: Number,
  totalInteriors: Number,
  duration:Number,
  numberOfCars:Number
});

module.exports = mongoose.model("Plan", planSchema);
