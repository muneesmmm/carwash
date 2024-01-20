const Vehicle = require("../modals/vehicleModel");
async function addVehicle(req, res) {
  try {
    console.log(req.body);
    const {
      vehicleNumber,
      type,
      owner
    } = req.body;

    // Save payment data to MongoDB
    const vehicle = new Vehicle({
      vehicleNumber,
      type,
      package,
      owner
    });
    // Save the transaction to the database
    await vehicle.save();

    res.status(201).json({ message: "Vehicle registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register Vehicle" });
  }
}

async function getVehicle(req, res) {
  try {
    const existingVehicle = await Vehicle.find();
    console.log(existingVehicle);
    if (existingVehicle) {
      res.status(201).json({ message: "success", data: existingVehicle });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register Vehicle" });
  }
}
async function getVehicleById(req, res) {
  try {
    var { id } = req.params;
    const existingVehicle = await Vehicle.findById(id);
    console.log(existingVehicle);
    if (existingVehicle) {
      res.status(201).json({ message: "success", data: existingVehicle });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Vehicle not found" });
  }
}
async function deleteVehicleById(req, res) {
  try {
    var { id } = req.params;
    const response = await Vehicle.findByIdAndDelete(id);
    console.log(response);
    if (response) {
      res.status(201).json({ message: "Vehicle deleted", data: response });
      return;
    } else {
      res.status(201).json({ message: "Vehicle not found" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Transaction not found" });
  }
}

module.exports = {
  addVehicle,
  getVehicle,
  getVehicleById,
  deleteVehicleById,
};
