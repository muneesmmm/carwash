
const Transaction = require("../modals/transactionModel");
const stripe = require("stripe")(
  "sk_test_51N4NIySBfnUL8Q3nau7omZK3DzrvQn6UFS5BHVZ3eoh8Hmpteh5TMuPHfjcNfLFQGT6cEvuEO5I0wxlsd0W8z9y600p0T9A9Bz"
);

async function addTransaction(req, res) {
  try {
    console.log(req.body);
    const { user, amount, currency } = req.body;

    // Save payment data to MongoDB
    const transaction = new Transaction({
      amount,
      currency,
      user,
    });
    // Save the transaction to the database
    await transaction.save();

    res.status(201).json({ message: "Transaction registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register Transaction" });
  }
}

async function getTransaction(req, res) {
  try {
    const existingTransaction = await Transaction.find();
    console.log(existingTransaction);
    if (existingTransaction) {
      res.status(201).json({ message: "success", data: existingTransaction });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register Transaction" });
  }
}
async function getTransactionById(req, res) {
  try {
    var { id } = req.params;
    const existingTransaction = await Transaction.findById(id);
    console.log(existingTransaction);
    if (existingTransaction) {
      res.status(201).json({ message: "success", data: existingTransaction });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Transaction not found" });
  }
}
async function deleteTransactionById(req, res) {
  try {
    var { id } = req.params;
    const response = await Transaction.findByIdAndDelete(id);
    console.log(response);
    if (response) {
      res.status(201).json({ message: "Transaction deleted", data: response });
      return;
    } else {
      res.status(201).json({ message: "Transaction not found" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Transaction not found" });
  }
}
async function createPayment(req, res) {

    try {
      const { amount, currency } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Hexcard",
                images: ["https://hexpeak.co.in/assets/img/hex__peak.webp"],
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:8080/payment-success", // Replace with your success URL
        cancel_url: "http://localhost:8080/payment-failed", // Replace with your cancel URL
      });

      res
        .status(200)
        .json({ sessionId: session.id, paymentIntent: paymentIntent });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}
async function createPaymentIntent(req, res) {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the Payment Intent." });
  }
}


module.exports = {
  addTransaction,
  getTransaction,
  getTransactionById,
  deleteTransactionById,
  createPayment,
  createPaymentIntent,
};
