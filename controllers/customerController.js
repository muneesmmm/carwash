const Vehicle = require("../modals/vehicleModel");
const Customer = require("../modals/customerModel");
const Plan = require("../modals/planModel");
const WashHistory = require('../modals/washHistory')
const Package = require("../modals/packageModel");
const Order = require("../modals/ordersModel");
const { mongoose, ObjectId } = require("mongoose");
async function addCustomer(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Extract user and vehicles data from the request body
    const { user, vehicles, selectedPlan, paymentType, staffId } = req.body;

    // Create a new customer
    const newUser = new Customer({
      name: user.name,
      email: user.email,
      phone: user.phone,
      paymentType,
    });

    // Create an array to store the created vehicles
    const createdVehicles = [];

    // Create and link each vehicle to the user
    for (const vehicleData of vehicles) {
      const newVehicle = new Vehicle({
        vehicleNumber: vehicleData.vehicleNumber,
        type: vehicleData.type,
        owner: newUser._id,
      });

      await newVehicle.save({ session });
      createdVehicles.push(newVehicle);
      newUser.vehicles.push(newVehicle._id);
    }

    await newUser.save({ session });

    // Create a package for the user
    const existingPlan = await Plan.findById(selectedPlan);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + existingPlan.duration);

    const newPackage = new Package({
      customer: newUser._id,
      plan: selectedPlan,
      remainingWashes: existingPlan.totalWashes,
      remainingInteriors: existingPlan.totalInteriors,
      startDate,
      endDate,
    });

    await newPackage.save({ session });

    // Link the package to the user (if needed)
    newUser.selectedPackage = newPackage._id;
    await newUser.save({ session });

    // Create an order for the user
    const newOrder = new Order({
      customer: newUser._id,
      package: newPackage._id,
      staff: staffId,
      orderDate: new Date(),
    });

    await newOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Respond with the newly created user, vehicles, and order
    res.json({ user: newUser, vehicles: createdVehicles, order: newOrder });
  } catch (error) {
    console.error("Error adding customer:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
}



// API endpoint to add a car for an existing user
async function addCar(req, res) {
  try {
    const userId = req.params.userId;
    const { vehicle } = req.body;

    // Find the existing user by ID
    const existingUser = await Customer.findById(userId);

    if (!existingUser) {
      return res.status(200).json({ message: "User not found", status: false });
    }

    // Create a new vehicle and link it to the user
    const newVehicle = new Vehicle({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      owner: existingUser._id,
    });

    // Save the vehicle to the database
    await newVehicle.save();

    // Link the vehicle to the user
    existingUser.vehicles.push(newVehicle);
    await existingUser.save();

    // Respond with the updated user and the newly added vehicle
    res.json({ user: existingUser, vehicle: newVehicle, status: true });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(200).json({ error: error.message, status: false });
  }
}
// API endpoint to remove a car for an existing user
async function removeCar(req, res) {
  try {
    const userId = req.params.userId;
    const carId = req.params.carId;

    // Find the existing user by ID
    const existingUser = await Customer.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the car by ID
    const carToRemove = await Vehicle.findById(carId);

    if (!carToRemove) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Remove the car from the user's vehicles array
    existingUser.vehicles.pull(carId);
    await existingUser.save();

    // Remove the car from the database
    await Vehicle.findByIdAndRemove(carId);

    // Respond with the updated user after removing the car
    res.json({ user: existingUser });
  } catch (error) {
    console.error("Error removing car:", error);
    res.status(500).json({ error: error.message });
  }
}
// API endpoint to get customer with vehicle data
async function getCustomerById(req, res) {
  try {
    const userId = req.params.userId;

    // Find the existing user by ID along with associated vehicles
    const customer = await Customer.findById(userId).populate(
      "vehicles"
    ).populate({
      path: "selectedPackage",
      populate: {
        path: "plan",
        model: "Plan", // Replace with your Vehicle model name
      }
    });

    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the user and associated vehicles
    res.json({ customer, status: true });
  } catch (error) {
    console.error("Error getting customer with vehicles:", error);
    res.status(500).json({ error: error.message });
  }
}
async function getCustomer(req, res) {
  try {
    // Find the customer where the vehicles array contains the specified vehicle number
    const vehicleNumber = req.params.number;
    let todayWashStatus = true;
    let todayIntStatus = true;
    let washStatus = true;
    let interiorStatus = true;
    let expired = false;
    let threeMonth = false
    let isCoupon = false
    let currentMonth = null
    const vehicle = await getVehicleByNumber(vehicleNumber);
    if (vehicle) {
      const customer = await Customer.findById(vehicle.owner)
        .populate("vehicles")
        .populate("selectedPackage")
        .populate({
          path: "selectedPackage",
          populate: {
            path: "plan",
            model: "Plan", // Replace with your Vehicle model name
          }
        })
        .exec();

      if (customer) {
        if (customer.selectedPackage) {
          let startDate = customer.selectedPackage?.startDate
          let endDate = customer.selectedPackage?.endDate
          currentMonth = getCurrentMonth(startDate, endDate);
          let selectedPackage = customer.selectedPackage;
          if (new Date() > new Date(selectedPackage.endDate)) {
            washStatus = false;
            interiorStatus = false;
            expired = true
          }
          if (customer.selectedPackage.plan) {
            let plan = customer.selectedPackage.plan
            if (plan.duration > 30) {
              threeMonth = true
            }
            isCoupon = (plan.name === "Coupon ordinary" || plan.name === "Coupon SUV");
          }
          if (selectedPackage.remainingWashes === 0) {
            washStatus = false;
            isCoupon = false
          }
          if (selectedPackage.remainingInteriors === 0) {
            interiorStatus = false;
            isCoupon = false

          }
        }
      } else {
        console.log("Customer not found for the given vehicle number");
        res.json({
          status: false,
          message: "Customer not found for the given vehicle number",
        });
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Set to the beginning of the day

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // Set to the end of the day

      // Find today's washes
      const todayWashes = await WashHistory.find({
        washDate: {
          $gte: todayStart, // Greater than or equal to the start of the day
          $lte: todayEnd // Less than or equal to the end of the day
        },
        washType: 'Wash', // Optionally filter by wash type
        vehicle: vehicle._id 
      }).exec();
      if (todayWashes.length > 0) {
        todayWashStatus = false;
        console.log("car washed today");
      }

      // Check if the vehicle has been washed today for Interior type
      const washedTodayInterior = await WashHistory.find({
        washDate: {
          $gte: todayStart, // Greater than or equal to the start of the day
          $lte: todayEnd // Less than or equal to the end of the day
        },
        washType: 'Interior', // Optionally filter by wash type
        vehicle: vehicle._id
      }).exec();
      if (washedTodayInterior.length > 0) {
        todayIntStatus = false;
        console.log("car Interior today");
      }
      let returnData = {
        data: customer,
        status: true,
        message: "Found customer",
        washStatus: washStatus, 
        interiorStatus: interiorStatus, 
        isExpired: expired, 
        currentMonth: currentMonth, 
        isThreeMonth: threeMonth, 
        isCoupon: isCoupon,
        todayWashStatus:todayWashStatus,
        todayIntStatus:todayIntStatus,
      }
      res.json(returnData);
    } else {
      res.json({
        status: false,
        message: "Customer not found for the given vehicle number",
      });
    }
  } catch (error) {
    console.error("Error finding customer by vehicle number:", error);
    throw error;
  }
}
async function getCustomers(req, res) {
  try {
    const customers = await Customer.find()
      .populate('vehicles')
      .populate('selectedPackage')
      .populate({
        path: 'selectedPackage',
        populate: {
          path: 'plan',
          model: 'Plan' // Replace with your Plan model name
        }
      })
      .sort({_id: -1})
      .exec();

    // const customersWithStaffName = [];

    // for (const customer of customers) {
    //   // Find the order for the current customer
    //   const order = await Order.findOne({ customer: customer._id }).populate('staff', 'name').exec();

    //   // Set the staff name for the current customer
    //   const customerWithStaffName = { ...customer.toObject(), staffName: order ? order.staff.name : "No Staff Assigned" };

    //   customersWithStaffName.push(customerWithStaffName);
    // }

    res.json({ message: "Registered Customers", customers});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching customers" });
  }
}

async function createAndUpdatePackage(req, res) {
  const { userId, newPlanId , paymentType , staffId } = req.body
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Get user details
    const user = await Customer.findById(userId).session(session);

    if (!user) {
      throw new Error('User not found');
    }

    // Get details of the new plan
    const newPlan = await Plan.findById(newPlanId);

    if (!newPlan) {
      throw new Error('New plan not found');
    }

    // Calculate start and end dates for the new package
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + newPlan.duration);

    // Create a new package
    const newPackage = new Package({
      customer: userId,
      plan: newPlanId,
      remainingWashes: newPlan.totalWashes,
      remainingInteriors: newPlan.totalInteriors,
      startDate,
      endDate,
    });

    // Save the new package
    await newPackage.save({ session });

    // Update the user's selected package ID with the ID of the new package
    user.selectedPackage = newPackage._id;
    user.paymentType = paymentType;
    await user.save({ session });
    const newOrder = new Order({
      customer: user._id,
      package: newPackage._id,
      staff: staffId,
      orderDate: new Date(),
    });

    await newOrder.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.json({
      status: true,
      message: "Package Updated", package: newPackage, user
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Error creating and updating package:", error
    });
    console.error('Error creating and updating package:', error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
async function updatePayment(req, res) {
  try {
    const { _id, paymentType } = req.body;

    // Find the plan by ID and update it
    // const numberOfDays = getNumberOfDays(duration);
    const updatedPayment = await Customer.findOneAndUpdate(
      { _id }, // Filter
      { $set: { 
          paymentType
        }
      }, // Update
      { new: true } // To return the updated document
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ message: "Plan updated successfully", updatedPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update plan" });
  }
}
module.exports = {
  addCustomer,
  addCar,
  removeCar,
  getCustomerById,
  getCustomer,
  getCustomers,
  createAndUpdatePackage,
  updatePayment
};
async function getVehicleByNumber(number) {
  try {
    const vehicle = await Vehicle.findOne({ vehicleNumber: new RegExp('^' + number + '$', 'i') });
    if (vehicle) {
      return vehicle;
    } else {
      return null
    }
  } catch (error) {
    console.error("Error finding customer by vehicle number:", error);
    throw error;
  }
}
function getCurrentMonth(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date();
  if (current >= start && current <= end) {
    const startYear = start.getFullYear();
    const currentYear = current.getFullYear();
    const startMonth = start.getMonth();
    const currentMonth = current.getMonth();

    const diffMonths = (currentMonth + currentYear * 12) - (startMonth + startYear * 12);
    return diffMonths + 1; // Calculate the relative month within the plan
  } else {
    return -1; // Indicates that the current date is not within the range of the plan
  }
}