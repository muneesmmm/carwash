const Orders = require("../modals/ordersModel");
const Customer = require('../modals/customerModel');
const Package = require('../modals/packageModel');
const Plan = require('../modals/planModel');
async function getOrders(req, res) {
  try {
    const existingOrders = await Orders.find()
    .populate('staff')
    .populate({
      path: "package",
      populate: {
        path: "plan",
        model: "Plan", // Replace with your Vehicle model name
      }
    })
    .populate({
      path: "customer",
      populate: {
        path: "vehicles",
        model: "Vehicle", // Replace with your Vehicle model name
      },
    }).sort({_id:-1})
    if (existingOrders) {
      res.status(201).json({ message: "success", data: existingOrders ,status:true});
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Plan" ,status:false});
  }
}
async function getOrderById(req, res) {
  try {
    var { id } = req.params;
    const existingOrders = await Orders.findById(id)
    .populate('staff')
    .populate({
      path: "package",
      populate: {
        path: "plan",
        model: "Plan", // Replace with your Vehicle model name
      }
    })
    .populate({
      path: "customer",
      populate: {
        path: "vehicles",
        model: "Vehicle", // Replace with your Vehicle model name
      },
    }).sort({_id:-1})
    if (existingOrders) {
      res.status(201).json({ message: "success", data: existingOrders });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan not found" });
  }
}
async function getOrderByStaffId(req, res) {
  try {
    var { staffId } = req.body;
    const existingOrders = await Order.find({ staff: staffId })
    .populate('staff')
    .populate({
      path: "package",
      populate: {
        path: "plan",
        model: "Plan", // Replace with your Vehicle model name
      }
    })
    .populate({
      path: "customer",
      populate: {
        path: "vehicles",
        model: "Vehicle", // Replace with your Vehicle model name
      },
    }).sort({_id:-1})
    if (existingOrders) {
      res.status(201).json({ message: "success", data: existingOrders });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan not found" });
  }
}
async function getTotalAmountByPaymentType(req, res) {
  try {
    const totalAmounts = await Customer.aggregate([
      {
        $lookup: {
          from: "packages", // Name of the Package collection
          localField: "_id",
          foreignField: "customer",
          as: "package"
        }
      },
      {
        $unwind: "$package"
      },
      {
        $lookup: {
          from: "plans", // Name of the Plan collection
          localField: "package.plan",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
      {
        $group: {
          _id: "$paymentType",
          totalAmount: { $sum: "$plan.price" }
        }
      }
    ]);

    res.json({ status: true, totalAmounts });
  } catch (error) {
    console.error("Error getting total amount by payment type:", error);
    res.status(500).json({ status: false, error: error.message });
  }
}
module.exports = {
  getOrders,
  getOrderById,
  getOrderByStaffId,
  getTotalAmountByPaymentType
};