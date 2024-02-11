const mongoose = require("mongoose");

const washSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  washDate:{
    type: Date,
    default: Date.now,
  },
  washType: {
    type: String,
    enum: ['Wash', 'Interior'], // Add other package options as needed
},
});
module.exports = mongoose.model('WashHistory', washSchema);
