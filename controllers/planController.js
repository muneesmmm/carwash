const Plan = require("../modals/planModel");
async function addPlan(req, res) {
  try {
    console.log(req.body);
    const {
        name,
        totalWashes,
        totalInteriors,
        duration,
        numberOfCars
    } = req.body;

    // Save payment data to MongoDB
    const plan = new Plan({
        name,
        totalWashes,
        totalInteriors,
        duration,
        numberOfCars
    });
    // Save the transaction to the database
    await plan.save();

    res.status(201).json({ message: "Plan Added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add plan" });
  }
}

async function getPlan(req, res) {
  try {
    const existingPlan = await Plan.find();
    console.log(existingPlan);
    if (existingPlan) {
      res.status(201).json({ message: "success", data: existingPlan ,status:true});
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Plan" ,status:false});
  }
}
async function getPlanById(req, res) {
  try {
    var { id } = req.params;
    const existingPlan = await Plan.findById(id);
    console.log(existingPlan);
    if (existingPlan) {
      res.status(201).json({ message: "success", data: existingPlan });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan not found" });
  }
}
async function deletePlanById(req, res) {
  try {
    var { id } = req.params;
    const response = await Vehicle.findByIdAndDelete(id);
    console.log(response);
    if (response) {
      res.status(201).json({ message: "Plan deleted", data: response });
      return;
    } else {
      res.status(201).json({ message: "Plan not found" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Plan not found" });
  }
}

module.exports = {
  addPlan,
  getPlan,
  getPlanById,
  deletePlanById,
};
