const mongoose = require("mongoose");
const moment = require('moment-timezone');
const washSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  washDate: {
    type: Date,
    default: Date.now,
  },
  washType: {
    type: String,
    enum: ['Wash', 'Interior'], // Add other package options as needed
  },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
});
// Static method to set the wash date to the current time in IST

module.exports = mongoose.model('WashHistory', washSchema);
