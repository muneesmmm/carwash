const Vehicle = require("../modals/vehicleModel");
const Customer = require("../modals/customerModel");
const WashHistory = require("../modals/washHistory");
const User = require("../modals/userModel");
async function getDashBoardData(req, res) {
    try {
        // Get the length of Vehicle collection
        const vehicleCount = await Vehicle.countDocuments();

        // Get the length of Customer collection
        const customerCount = await Customer.countDocuments();

        // Get the length of WashHistory collection
        const washHistoryCount = await WashHistory.countDocuments();

        // Get the length of User collection
        const userCount = await User.countDocuments();
        res.status(201).json({
            message: "success", data: {
                vehicleCount,
                customerCount,
                washHistoryCount,
                userCount
            }, status: true
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(201).json({
            message: "not found", status: false
        });
    }
}
module.exports = {
    getDashBoardData
};