const bcrypt = require("bcrypt");
const User = require("../modals/userModel");
const Transaction = require("../modals/transactionModel");
const authHelpers = require("../helpers/auth");
const { uploadFileToS3 } = require("../helpers/s3Upload");
async function registerUser(req, res) {
  try {
    const { username, name, password, email, phone, location ,role} = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarFile = req.file;
    if (avatarFile) {
      var avatarUrl = await uploadFileToS3(avatarFile);
    }
    // Save the user to the database
    const user = new User({
      username,
      name,
      email,
      phone,
      location,
      role,
      password: hashedPassword
      // avatar: avatarUrl,
      // Assuming you store the S3 file URL in the 'location' property
    });
    const userId = await generateStaffID();
    user.staffId = userId;
    const userData = await user.save();
    const token = authHelpers.generateToken(userData._id);
    res
      .status(201)
      .json({ message: "User registered successfully", token, userData,status: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" , status: false});
  }
}
async function updateUser(req, res) {
  try {
    const {
      name,
      email,
      phone,
      role,
      password,
    } = req.body;
    const { id } = req.params;
    // Check if the username already exists
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(200).json({ message: "User not exists" });
      return;
    }

    // Save the user to the database

    existingUser.name = name || existingUser.name;
    existingUser.email = email || existingUser.email;
    existingUser.phone = phone || existingUser.phone;
    existingUser.role = role || existingUser.role;
    if(password = null){
      existingUser.password = existingUser.password;
    }else{
      existingUser.password = hashedPassword
    }


    const userData = await existingUser.save();
    const token = authHelpers.generateToken(userData._id);
    res
      .status(201)
      .json({ message: "User updated successfully", token, userData });
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Failed to update user" });
  }
}
async function updateAvatar(req, res) {
  try {
    const { id } = req.params;
    // Check if the username already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(409).json({ message: "User not exists" });
      return;
    }
    const avatarFile = req.file;
    if (avatarFile) {
      var avatarUrl = await uploadFileToS3(avatarFile);
    }
    // Save the user to the database
    existingUser.avatar = avatarUrl;
    const userData = await existingUser.save();
    res.status(201).json({ message: "successfull", userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });

    // If user not found or password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(200).json({ message: "Invalid username or password",status: false  });
      return;
    }

    // Generate a new JWT token using the helper function
    const token = authHelpers.generateToken(user._id);

    res.json({ message: "Login successful", token, user,status: true  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to login",status: false  });
  }
}
async function getUsers(req, res) {
  try {
    // Find the user in the database
    const user = await User.find();
    // Generate a new JWT token using the helper function
    res.json({ message: "Registered User", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No Users" });
  }
}
async function getUserbyId(req, res) {
  try {
    // Find the user in the database
    const { id } = req.body;
    const user = await User.findById(id);

    res.json({ message: "Registered User", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No Users" });
  }
}
async function deleteUserbyId(req, res) {
  try {
    // Find the user in the database
    const { id } = req.body;
    const user = await User.deleteOne({'_id':id});

    res.json({ message: "User delete success", });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No Users" });
  }
}
async function updatePayment(req, res) {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;
    // Check if the username already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(409).json({ message: "User not exists" });
      return;
    }

    // Save the user to the database

    if (paymentStatus === true) {
      existingUser.paymentStatus = true;
      const transaction = new Transaction({
        user: existingUser._id,
        currency: "inr",
        amount: 1500.0,
        // Assuming you store the S3 file URL in the 'location' property
      });
      await transaction.save();
    } else {
      existingUser.paymentStatus = false;
    }
    const userData = await existingUser.save();
    const token = authHelpers.generateToken(userData._id);
    res
      .status(201)
      .json({ message: "User registered successfully", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  } 
}

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  updateAvatar,
  updatePayment,
  getUserbyId,
  deleteUserbyId
};
async function generateStaffID() {
  try {
    // Find the latest staff record to get the current ID
    const latestStaff = await User.findOne().sort({ _id: -1 }).exec();
    
    let currentID = 1; // Default ID if no existing staff
    
    if (latestStaff && latestStaff.staffId) {
      // Get the current ID from the latest staff record
      currentID = parseInt(latestStaff.staffId.substr(3)) + 1;
    }

    // Generate the new staff ID (you can adjust the format as needed)
    const newID = `emp${currentID.toString().padStart(4, '0')}`;
    
    // Return the new ID
    return newID;
  } catch (error) {
    console.error('Error generating staff ID:', error);
    throw error;
  }
}