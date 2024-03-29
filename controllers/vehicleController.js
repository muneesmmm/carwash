const Package = require("../modals/packageModel");
const Vehicle = require("../modals/vehicleModel");
const WashHistory = require("../modals/washHistory");
const smsController = require("../controllers/smsController");

const moment = require('moment-timezone');
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
      owner
    });
    // Save the transaction to the database
    await vehicle.save();

    res.status(200).json({ message: "Vehicle registered successfully",status:true });
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed to register Vehicle",status:false });
  }
}
async function addWash(req, res) {
  try {
    const { vehicle, staff, washDate } = req.body;
    const { package } = req.params; // Renamed variable for clarity
    console.log(req.body, package);

    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(200).json({ message: "Package not found", status: false });
    }

    if (existingPackage.remainingWashes > 0) {
      existingPackage.remainingWashes--;
      const updatedPackage = await existingPackage.save();
      // Set the timezone to India (Asia/Kolkata)
      moment.tz.setDefault('Asia/Kolkata');

      // Get the current date and time in India
      const currentDateTime = moment().toDate();

      // Save payment data to MongoDB
      const wash = new WashHistory({
        vehicle,
        staff,
        washDate: currentDateTime, // Use provided washDate or current date/time
        washType: "Wash",
        package
      });

      // Save the transaction to the database
      await wash.save();
      checkStatusAndNotify(updatedPackage)
      return res.status(200).json({ message: "Wash added successfully", updatedPackage, status: true });
    } else {
      return res.status(200).json({ message: "No washes remaining", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(200).json({ message: "Failed to add wash", status: false });
  }
}
async function coupenWash(req, res) {
  try {
    const { vehicle, staff, washDate } = req.body;
    const { package } = req.params; // Renamed variable for clarity
    console.log(req.body, package);

    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(200).json({ message: "Package not found", status: false });
    }

    if (existingPackage.remainingWashes > 0 && existingPackage.remainingInteriors > 0) {
      existingPackage.remainingWashes--;
      existingPackage.remainingInteriors--;
      const updatedPackage = await existingPackage.save();

      // Set the timezone to India (Asia/Kolkata)
      moment.tz.setDefault('Asia/Kolkata');

      // Get the current date and time in India
      const currentDateTime = moment().toDate();

      // Save payment data to MongoDB
      const wash = new WashHistory({
        vehicle,
        staff,
        washDate: currentDateTime, // Use provided washDate or current date/time
        washType: "Wash",
        package
      });

      // Save the transaction to the database
      await wash.save();
      checkStatusAndNotify(updatedPackage)

      return res.status(200).json({ message: "Wash added successfully", updatedPackage, status: true });
    } else {
      return res.status(200).json({ message: "No washes remaining", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(200).json({ message: "Failed to add wash", status: false });
  }
}
async function interiorWash(req, res) {
  try {
    const { vehicle, staff } = req.body;
    let { package } = req.params;
    console.log(req.body);

    const existingPackage = await Package.findById(package);
    if (!existingPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    if (existingPackage.remainingInteriors > 0) {
      existingPackage.remainingInteriors--;
      const updatedPackage = await existingPackage.save();

      // Set the timezone to India (Asia/Kolkata)
      moment.tz.setDefault('Asia/Kolkata');

      // Get the current date and time in India
      const currentDateTime = moment().toDate();

      // Save payment data to MongoDB
      const wash = new WashHistory({
        vehicle,
        staff,
        washDate: currentDateTime, // Use current date/time in IST
        washType: "Interior",
        package
      });

      // Save the transaction to the database
      await wash.save();
      checkStatusAndNotify(updatedPackage)
      return res.status(200).json({ message: "Interior wash successfully", updatedPackage, status: true });
    } else {
      return res.status(200).json({ message: "No interior washes remaining", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed", status: false });
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
    .sort({ washDate: 1 })
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
    const washes = await WashHistory.find({ vehicle })
      .populate('vehicle')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      })
      .sort({ washDate: 1 })
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
    const { staff } = req.params;
    const washes = await WashHistory.find({ staff })
      .populate('vehicle')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      }).sort({ washDate: 1 });

    if (washes && washes.length > 0) {
      // Map over the wash history data and format the time for each record
      const washesWithFormattedTime = washes.map(wash => {
        // Ensure washDate is converted to a Date object
        const washDate = new Date(wash.washDate);
        // Parse the date using Moment.js and format it in IST timezone
        const formattedTime = moment(washDate).tz('Asia/Kolkata').format('hh:mm A');
        return {
          ...wash.toObject(),
          formattedTime
        };
      });

      // Send the response with the formatted time
      res.status(200).json({ message: "success", data: washesWithFormattedTime, status: true });
    } else {
      res.status(200).json({ message: "No washes found for the given staff ID", status: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}



async function getWashesByDateForStaff(req, res) {
  moment.tz.setDefault('Asia/Kolkata');
  try {
    const { staff } = req.params;

    // Find washes for the specified staff and current date
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set to the beginning of the day

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Set to the end of the day
    const washes = await WashHistory.find({
      staff: staff,
      washDate: {
        $gte: todayStart, // Greater than or equal to the beginning of the day
        $lt: todayEnd // Less than the end of the day
      }
    }).populate('vehicle')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      }).sort({ _id: -1 })

    if (washes && washes.length > 0) {
      // Map over the wash history data and format the time for each record
      const washesWithFormattedTime = washes.map(wash => {
        // Create a Date object from the string
        const washDate = new Date(wash.washDate);
        // Convert the Date object to Moment object and format to IST
        const formattedTime = moment(washDate).tz('Asia/Kolkata').format('hh:mm A');
        return {
          ...wash.toObject(),
          formattedTime
        };
      });

      // Send the response with the formatted time
      res.status(200).json({ message: "success", data: washesWithFormattedTime, status: true });
    } else {
      res.status(200).json({ message: "No washes found for the given staff ID on the current date", status: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, status: false });
  }
}
async function getWashesByDateForCustomer(req, res) {
  moment.tz.setDefault('Asia/Kolkata');
  // Get the current date and time in India
  const today = moment().startOf('day'); // Start of the current day

  try {
    const { user } = req.params;

    // Find washes for the specified staff and current date
    const washes = await WashHistory.find({
      staff: staff,
      washDate: {
        $gte: today.toDate(), // Greater than or equal to the beginning of the day
        $lt: moment(today).endOf('day').toDate() // Less than the end of the day
      }
    }).populate('vehicle')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      }).sort({ _id: -1 });

    if (washes && washes.length > 0) {
      // Map over the wash history data and format the time for each record
      const washesWithFormattedTime = washes.map(wash => {
        // Create a Date object from the string
        const washDate = new Date(wash.washDate);
        // Convert the Date object to Moment object and format to IST
        const formattedTime = moment(washDate).tz('Asia/Kolkata').format('hh:mm A');
        return {
          ...wash.toObject(),
          formattedTime
        };
      });

      // Send the response with the formatted time
      res.status(200).json({ message: "success", data: washesWithFormattedTime, status: true });
    } else {
      res.status(200).json({ message: "No washes found for the given staff ID on the current date", status: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, status: false });
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
    const washes = await WashHistory.find()
      .populate('vehicle')
      .populate('staff')
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          model: "Customer", // Replace with your Vehicle model name
        }
      }).sort({ _id: -1 })

    if (washes && washes.length > 0) {
      // Map over the wash history data and format the time for each record
      const washesWithFormattedTime = washes.map(wash => {
        // Ensure washDate is converted to a Date object
        const washDate = new Date(wash.washDate);
        // Parse the date using Moment.js and format it in IST timezone
        const formattedTime = moment(washDate).tz('Asia/Kolkata').format('hh:mm A');
        return {
          ...wash.toObject(),
          formattedTime
        };
      });

      // Send the response with the formatted time
      res.status(200).json({ message: "success", data: washesWithFormattedTime });
    } else {
      res.status(404).json({ message: "No washes found for the given staff ID" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function updateVehicle(req, res) {
  try {
    const {
      vehicleId,
      updatedVehicleNumber,
      updatedType
    } = req.body;

    // Find the vehicle by ID
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(200).json({ message: "Vehicle not found",status:false });
    }

    // Update vehicle properties if provided
    if (updatedVehicleNumber) {
      vehicle.vehicleNumber = updatedVehicleNumber;
    }
    if (updatedType) {
      vehicle.type = updatedType;
    }

    // Save the updated vehicle to the database
    await vehicle.save();

    res.status(200).json({ message: "Vehicle updated successfully" ,status:true});
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed to update vehicle",status:false });
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
  getWashesByDateForStaff,
  getWashesByDateForCustomer,
  coupenWash,
  updateVehicle
};
async function checkStatusAndNotify(package) {
  try {
    const populatedPackage = await Package.findById(package._id).populate('customer').exec();
    const washHistory = await WashHistory.find({ package: package._id });
    if (populatedPackage.remainingWashes === 0 && populatedPackage.remainingInteriors === 0) {
      await sendSMSNotification(populatedPackage.customer.phone, washHistory);
    }
  } catch (error) {
    console.error('nofification not send:', error);
    throw error;
  }
}
async function sendSMSNotification(phone, history, res) {
  try {
    const message = await smsController.sendSMS(phone, history);
    console.log('Message sent! SID:', message.sid);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message:', error);
    console.log('Failed to send message');
  }
}