const Package = require("../modals/packageModel");
const Plan = require("../modals/planModel");
async function getPackages(req, res) {
  try {
    const existingPackage = await Package.find()
      .populate({
        path: "customer",
        populate: {
          path: "vehicles",
          model: "Vehicle", // Replace with your Vehicle model name
        },
      })
      .populate("plan");
    console.log(existingPackage);
    if (existingPackage) {
      res
        .status(201)
        .json({ message: "success", data: existingPackage, status: true });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Package", status: false });
  }
}
async function getPackageById(req, res) {
  try {
    var { id } = req.params;
    const existingPackage = await Package.findById(id)
      .populate({
        path: "customer",
        populate: {
          path: "vehicles",
          model: "Vehicle", // Replace with your Vehicle model name
        },
      })
      .populate("plan");
    console.log(existingPackage);
    if (existingPackage) {
      res.status(201).json({ message: "success", data: existingPackage });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Package not found" });
  }
}
async function updatePlan(req, res) {
  try {
    const { packageId, newPlanId } = req.body;

    // Find the package by ID
    const existingPackage = await Package.findById(packageId);

    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Update the plan inside the package
    existingPackage.plan = newPlanId;

    // Save the updated package
    await existingPackage.save();

    res.status(200).json({ message: "Package plan updated successfully", data: existingPackage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while updating the package plan" });
  }
}

async function getPackageByCustomerId(req, res) {
  try {
    var { customer } = req.params;
    const existingPackage = await Package.find({customer})
    .populate("plan")
    .sort({startDate:-1});
    console.log(existingPackage);
    if (existingPackage) {
      res.status(201).json({ message: "success", data: existingPackage });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Package not found" });
  }
}
async function deletePackageById(req, res) {
  try {
    var { id } = req.params;
    const response = await Package.findByIdAndDelete(id);
    console.log(response);
    if (response) {
      res.status(201).json({ message: "Package deleted", data: response });
      return;
    } else {
      res.status(201).json({ message: "Package not found" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan not found" });
  }
}

module.exports = {
  getPackages,
  getPackageById,
  deletePackageById,
  getPackageByCustomerId,
  updatePlan
};
