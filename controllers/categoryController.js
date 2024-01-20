
const Category = require("../modals/categoryModel");
const { ObjectId } = require("mongodb");
async function addCategory(req, res) {
  try {
    const { name, type } = req.body;
    console.log(req.body);
    // Check if the Category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(409).json({ message: "Category already exists" });
      return;
    }
    // Create a new category
    const category = new Category({ name, type });

    // Save the category to the database
    await category.save();

    res.status(201).json({ message: "category registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register category" });
  }
}

async function getCategory(req, res) {
   try {
     const existingCategory = await Category.find();
     console.log(existingCategory);
     if (existingCategory) {
       res.status(201).json({ message: "success", data: existingCategory });
       return;
     }
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: "Failed to register category" });
   }
}
async function getCategoryById(req, res) {
  try {
    var { id } = req.params;
    const existingCategory = await Category.findById(id);
    console.log(existingCategory);
    if (existingCategory) {
      res.status(201).json({ message: "success", data: existingCategory });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Category not found" });
  }
}
async function deleteCategoryById(req, res) {
  try {
    var { id } = req.params;
    const response = await Category.findByIdAndDelete(id);
    console.log(response);
    if (response) {
      res.status(201).json({ message: "Category deleted", data: response });
      return;
    }else{
      res.status(201).json({ message: "Category not found" });
      return
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Category not found" });
  }
}

module.exports = {
  addCategory,
  getCategory,
  getCategoryById,
  deleteCategoryById,
};
