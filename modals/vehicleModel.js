const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: String,
  type: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
});
module.exports = mongoose.model('Vehicle', vehicleSchema);
