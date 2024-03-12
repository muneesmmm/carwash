const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  staff: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
