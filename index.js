// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authHelpers = require("./helpers/auth");
const userController = require("./controllers/userController");
const categoryController = require("./controllers/categoryController");
const transactionController = require("./controllers/transactionController");
const vehicleController = require("./controllers/vehicleController");
const customerController = require("./controllers/customerController");
const orderController = require("./controllers/orderController");
const planController = require("./controllers/planController");
const packageController = require("./controllers/packageController"); 
const dashboardController = require("./controllers/dashboardController"); 
const uploadHelper = require("./helpers/s3Upload");
const cors = require("cors");
const emailController = require("./controllers/emailController");
const smsController = require("./controllers/smsController");
require("dotenv").config();
const app = express();
const port = 8080;

app.use(
  cors({
    origin: "https://admin.wecarecarwash.in", // Replace with your frontend's origin URL
    allowedHeaders: ["Content-Type", "Authorization"], // Add any additional headers you want to allow
  })
);
app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', 'https://admin.wecarecarwash.in');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
res.setHeader('Access-Control-Allow-Credentials', true);
next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using Mongoose
mongoose
  .connect(
    "mongodb+srv://muneesmmm:k9O28TfAPV52WZJC@carwash.grf9fp7.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Routes
// app.use(authHelpers.authenticateToken);
app.post(
  "/register",
  uploadHelper.upload.single("avatar"),
  userController.registerUser
);

app.post("/login", userController.loginUser);
app.post("/get-users", userController.getUsers);
app.post("/getuser", userController.getUserbyId);
app.post("/delete-user", userController.deleteUserbyId);
app.post("/update/:id", userController.updateUser);
app.post("/update-payment/:id", userController.updatePayment);
app.post("/update-avatar/:id",uploadHelper.upload.single("avatar"), userController.updateAvatar);
app.get("/protected", authHelpers.authenticateToken, (req, res) => {
  // Access the authenticated user using req.user
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
app.post("/get-customers", customerController.getCustomers);
app.post("/add-category", categoryController.addCategory);
app.post("/get-category", categoryController.getCategory);
app.post("/get-category/:id", categoryController.getCategoryById);
app.post("/delete-category/:id", categoryController.deleteCategoryById);
// app.post("/add-transactions", transactionController.addTransaction);
app.post("/get-transactions", transactionController.getTransaction);
app.post("/get-transactions/:id", transactionController.getTransactionById);
app.post("/create-payment", transactionController.createPayment);
app.post("/create-paymentintent", transactionController.createPaymentIntent);
app.post("/payment-confirm", transactionController.addTransaction);
app.post(
  "/delete-transactions/:id",
  transactionController.deleteTransactionById
);
app.post("/create-vehicle", vehicleController.addVehicle);
app.post(
  "/delete-vehicle/:id",
  vehicleController.deleteVehicleById
);
app.post("/get-vehicles", vehicleController.getVehicle);
app.post("/get-vehicles/:id", vehicleController.getVehicleById);
app.post('/createCustomer', customerController.addCustomer);
app.post('/add-car/:userId', customerController.addCar)
app.post('/removeCar/:userId/:carId',customerController.removeCar)
app.post('/customer/:userId',customerController.getCustomerById)
app.post('/add-plan/', planController.addPlan)
app.post("/get-plans", planController.getPlan);
app.post("/get-plans-list", planController.getPlanByNumberOfVehicle);
app.post("/update-plans", planController.updatePlan);
app.post("/get-plan/:id", planController.getPlanById);
app.post("/get-package/:id", packageController.getPackageById);
app.post("/update-selected-plan", packageController.updatePlan);
app.post("/get-customer-packages/:customer", packageController.getPackageByCustomerId);
app.post("/get-package", packageController.getPackages);
app.post("/get-customer/:number", customerController.getCustomer);
app.post("/renew-package", customerController.createAndUpdatePackage);
app.post("/complete-wash/:package", vehicleController.addWash);
app.post("/complete-coupen-wash/:package", vehicleController.coupenWash);
app.post("/complete-interior/:package", vehicleController.interiorWash);
app.post("/get-washes/:staff", vehicleController.getWashesByStaffId);
app.post("/get-washes", vehicleController.getWashes);
app.post("/get-vehicle-washes/:vehicle", vehicleController.getWashesByVehicle);
app.post("/vehicles-to-wash", vehicleController.getVehiclesToWash);
app.post("/today-washes/:staff", vehicleController.getWashesByDateForStaff);
app.post("/today-customer-washes/:user", vehicleController.getWashesByDateForCustomer);
app.post("/dashboard-data", dashboardController.getDashBoardData);
app.post('/send-email', emailController.sendEmail); 
app.post('/sendSMS', (req, res) => {
  const { to, message } = req.body;

  smsController.sendSMS(to, message)
    .then(message => {
      console.log('Message sent! SID:', message.sid);
      res.send('Message sent successfully!');
    })
    .catch(error => {
      console.error('Error sending message:', error);
      res.status(500).send('Failed to send message');
    });
  });


  app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.post("/get-orders", orderController.getOrders);
app.post("/get-staff-orders", orderController.getOrderByStaffId);
app.post("/update-payment-status", customerController.updatePayment);
