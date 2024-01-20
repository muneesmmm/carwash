// helpers/auth.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(userId) {
  // Generate a new JWT token
  const token = jwt.sign({ userId }, process.env.JWT_TOCKEN, {
    expiresIn: "60h",
  });
  return token;
}

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.JWT_TOCKEN, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    req.user = user;
    console.log(user);
    next();
  });
}

module.exports = {
  generateToken,
  authenticateToken,
};
