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

    res.status(200).json({ message: "Vehicle registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed to register Vehicle" });
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
      res.status(200).json({ message: "Package not found", status: false });
    }

    // Update fields based on the provided data
    if (existingPackage.remainingWashes > 0) {
      existingPackage.remainingWashes = existingPackage.remainingWashes - 1
      const updatedPackage = await existingPackage.save();
      // Save payment data to MongoDB
      const wash = new WashHistory({
        vehicle,
        staff,
        washDate,
        washType: "Wash"
      });
      // Save the transaction to the database
      await wash.save();
      res.status(200).json({ message: "wash added successfully", updatedPackage: updatedPackage, status: true });

    } else {
      res.status(200).json({ message: "no wash found", status: false });

    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed", status: false });
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
    console.log(req.body);
    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(200).json({ error: 'Package not found' });
    }
    if (existingPackage.remainingInteriors > 0) {
      existingPackage.remainingInteriors = existingPackage.remainingInteriors - 1;
      const updatedPackage = await existingPackage.save();
      // Save payment data to MongoDB 
      const wash = new WashHistory({
        vehicle,
        staff,
        washDate,
        washType: "Interior"
      });
      // Save the transaction to the database
      await wash.save();
      res.status(200).json({ message: "interior wash successfully", updatedPackage: updatedPackage, status: true });

    } else {
      res.status(200).json({ message: "interior wash not found", status: false });
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed", status: false });
  }
}

async function getVehicle(req, res) {
  try {
    const existingVehicle = await Vehicle.find();
    console.log(existingVehicle);
    if (existingVehicle) {
      res.status(200).json({ message: "success", data: existingVehicle });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed to register Vehicle" });
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
      res.status(200).json({ message: "success", data: vehicles });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "not Found" });
  }
}
async function getVehicleById(req, res) {
  try {
    var { id } = req.params;
    const existingVehicle = await Vehicle.findById(id);
    console.log(existingVehicle);
    if (existingVehicle) {
      res.status(200).json({ message: "success", data: existingVehicle });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Vehicle not found" });
  }
}
async function getWashesByVehicle(req, res) {
  try {
    var { vehicle } = req.params;
    const washes = await WashHistory.find({ vehicle });
    if (washes) {
      res.status(200).json({ message: "success", data: washes });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "not found" });
  }
}
async function getWashesByStaffId(req, res) {
  try {
    var { staff } = req.params;
    const washes = await WashHistory.find({ staff })
      .populate('vehicle')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      })
    if (washes) {
      res.status(200).json({ message: "success", data: washes });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "not found" });
  }
}
async function getWashesByDateForStaff(req, res) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

  try {
    const { staff } = req.params;

    // Find washes for the specified staff and current date
    const washes = await WashHistory.find({
      staff: staff,
      washDate: {
        $gte: today,  // Greater than or equal to the beginning of the day
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)  // Less than the beginning of the next day
      }
    }).populate('vehicle')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      })


    if (washes.length > 0) {
      res.status(200).json({ message: "success", data: washes, status: true });
    } else {
      res.status(200).json({ message: "No wash history found for the specified staff on the current date", status: false });
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Internal Server Error", error: error.message, status: false });
  }

}
async function deleteVehicleById(req, res) {
  try {
    var { id } = req.params;
    const response = await Vehicle.findByIdAndDelete(id);
    console.log(response);
    if (response) {
      res.status(200).json({ message: "Vehicle deleted", data: response });
      return;
    } else {
      res.status(200).json({ message: "Vehicle not found" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Transaction not found" });
  }
}
async function getWashes(req, res) {
  try {
    const currentWashes = await WashHistory.find();
    if (currentWashes) {
      res.status(200).json({ message: "success", data: currentWashes });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "not found" });
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
  getVehiclesToWash,
  getWashesByDateForStaff
};
