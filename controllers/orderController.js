const Orders = require("../modals/ordersModel");
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
    })
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
    })
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
    })
    if (existingOrders) {
      res.status(201).json({ message: "success", data: existingOrders });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan not found" });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  getOrderByStaffId
};