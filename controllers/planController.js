const Plan = require("../modals/planModel");
async function addPlan(req, res) {
  try {
    console.log(req.body);
    const {
        name,
        totalWashes,
        totalInteriors,
        duration,
        numberOfCars,
        price
    } = req.body;
    // const numberOfDays = getNumberOfDays(duration);
    // Save payment data to MongoDB
    const plan = new Plan({
        name,
        totalWashes,
        totalInteriors,
        duration,
        numberOfCars,
        price
    });
    // Save the transaction to the database
    await plan.save();

    res.status(201).json({ message: "Plan Added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add plan" });
  }
}
async function updatePlan(req, res) {
  try {
    const { _id, name, totalWashes, totalInteriors, duration, numberOfCars, price } = req.body;

    // Find the plan by ID and update it
    // const numberOfDays = getNumberOfDays(duration);
    const updatedPlan = await Plan.findOneAndUpdate(
      { _id }, // Filter
      { $set: { 
          name,
          totalWashes,
          totalInteriors,
          duration ,
          numberOfCars,
          price
        }
      }, // Update
      { new: true } // To return the updated document
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ message: "Plan updated successfully", updatedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update plan" });
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
async function getPlanByNumberOfVehicle(req, res) {
  try {
    const existingPlan = await Plan.find();
    if (existingPlan) {
      const dualWashPlans = existingPlan.filter(plan => plan.totalWashes >= 2);
      const singleWashPlans = existingPlan.filter(plan => plan.totalWashes === 1);
      res.status(201).json({ message: "success", data: {singleWashPlans,dualWashPlans} ,status:true});
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
  updatePlan,
  getPlanByNumberOfVehicle
};
// function getNumberOfDays(durationInMonths) {
//   const currentDate = new Date();
//   const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + durationInMonths, currentDate.getDate());
//   const diffTime = endDate.getTime() - currentDate.getTime();
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
//   return diffDays;
// }