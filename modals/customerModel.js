const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
    paymentType: {
        type: String,
        enum: ['CASH', 'BANK','PAY_LATER'],
    },
    selectedPackage:{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }
});

module.exports =  mongoose.model('Customer', customerSchema);