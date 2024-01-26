const Package = require("../modals/packageModel");
const Vehicle = require("../modals/vehicleModel");
const WashHistory = require("../modals/washHistory");
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
async function addWash(req, res) {
  try {
    const {
      vehicle,
      staff,
      washDate
    } = req.body;
    let { package } = req.params;
    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Update fields based on the provided data
    existingPackage.remainingWashes = existingPackage.remainingWashes-1;
    const updatedPackage = await existingPackage.save();
    // Save payment data to MongoDB
    const wash = new WashHistory({
      vehicle,
      staff,
      washDate,
      washType:"Wash"
    });
    // Save the transaction to the database
    await wash.save();

    res.status(201).json({ message: "wash added successfully",updatedPackage:updatedPackage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed" });
  }
}
async function interiorWash(req, res) {
  try {
    const {
      vehicle,
      staff,
      washDate
    } = req.body;
    let { package } = req.params;
    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Update fields based on the provided data
    existingPackage.remainingInteriors = existingPackage.remainingInteriors-1;
    const updatedPackage = await existingPackage.save();
    // Save payment data to MongoDB
    const wash = new WashHistory({
      vehicle,
      staff,
      washDate,
      washType:"Interior"
    });
    // Save the transaction to the database
    await wash.save();

    res.status(201).json({ message: "interior wash successfully",updatedPackage:updatedPackage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed" });
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
async function getVehiclesToWash(req, res) {
  try {
    const currentDate = new Date();
    const packages = await Package.find({
      remainingWashes: { $gt: 0 },
      remainingInteriors: { $gt: 0 },
      endDate: { $gte: currentDate },
    }).populate({
      path: "customer",
      populate: {
        path: "vehicles",
        model: "Vehicle", // Replace with your Vehicle model name
      }, 
    })
    if (packages) {
      const vehicles = packages.reduce((result, pack) => {
        if (pack.customer && pack.customer.vehicles) {
          result.push(...pack.customer.vehicles);
        }
        return result;
      }, []);
      res.status(201).json({ message: "success", data: vehicles });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "not Found" });
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
async function getWashesByVehicle(req, res) {
  try {
    var { vehicle } = req.params;
    const washes = await WashHistory.find({vehicle}); 
    if (washes) {
      res.status(201).json({ message: "success", data: washes });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "not found" });
  }
}
async function getWashesByStaffId(req, res) {
  try {
    var { staff } = req.params;
    const washes = await WashHistory.find({staff});
    if (washes) {
      res.status(201).json({ message: "success", data: washes });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "not found" });
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
async function getWashes(req, res) {
  try {
    const currentWashes = await WashHistory.find();
    if (currentWashes) {
      res.status(201).json({ message: "success", data: currentWashes });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "not found" });
  }
}
module.exports = {
  addVehicle,
  getVehicle,
  getVehicleById,
  deleteVehicleById,
  addWash,
  getWashesByStaffId,
  getWashes,
  getWashesByVehicle,
  interiorWash,
  getVehiclesToWash
};
