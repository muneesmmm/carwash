const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
    paymentType: {
        type: String,
        enum: ['online', 'offline'], // Add other package options as needed
    },
    selectedPackage:{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }
});

module.exports =  mongoose.model('Customer', customerSchema);