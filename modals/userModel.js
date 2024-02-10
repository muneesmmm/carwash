const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  phone: Number,
  staffId: String,
  role:{
      type: String,
      default: "staff",
    },
  // avatar: {
  //   type: String,
  //   default: "default-avatar.png", // Set a default avatar file name if desired
  // },
});

module.exports = mongoose.model("User", userSchema);
