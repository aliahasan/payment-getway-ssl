const axios = require("axios");
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");
const qs = require("qs"); // Import qs for URL-encoded data

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

// Create a MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });

const paymentsCollection = client.db("payments").collection("payments");

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/create-payment", async (req, res) => {
  try {
    const paymentInfo = req.body;
    const transId = new ObjectId().toString();
    const initiateData = {
      store_id: "progr66b8dfe1087cc",
      store_passwd: "progr66b8dfe1087cc@ssl",
      total_amount: paymentInfo.amount,
      currency: "BDT",
      tran_id: transId,
      success_url: "http://localhost:5000/success-payment",
      fail_url: "http://localhost:5000/fail",
      cancel_url: "http://localhost:5000/cancel",
      cus_name: "Customer Name",
      cus_email: "cust@yahoo.com",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: 1000,
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      shipping_method: "NO",
      product_name: "Laptop",
      product_category: "Laptop",
      product_profile: "general",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
      multi_card_name: "mastercard,visacard,amexcard",
      value_a: "ref001_A",
      value_b: "ref002_B",
      value_c: "ref003_C",
      value_d: "ref004_D",
    };

    const axiosResponse = await axios({
      method: "POST",
      url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      data: qs.stringify(initiateData), // Use qs.stringify to format data
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const saveData = {
      customer_name: "Nabin",
      paymentId: transId,
      amount: paymentInfo.amount,
      status: "pending",
    };

    const mongoResult = await paymentsCollection.insertOne(saveData);
    if (mongoResult.acknowledged) {
      res.send({
        paymentUrl: axiosResponse.data.GatewayPageURL,
      });
    } else {
      res.status(500).json({ error: "Failed to save payment data" });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Error creating payment" });
  }
});

app.post("/success-payment", async (req, res) => {
  try {
    const successData = req.body;

    // Check if the payment status is valid
    if (successData.status !== "VALID") {
      return res.status(400).json({ error: "Invalid Payment" });
    }

    // Update the payment status in the database
    const query = {
      paymentId: successData.tran_id,
    };
    const update = {
      $set: {
        status: "success",
      },
    };

    const updateResult = await paymentsCollection.updateOne(query, update);
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Payment record not found" });
    }
    res.redirect("http://localhost:5173/success");
  } catch (error) {
    console.error("Error during success payment handling:", error);
    res.status(500).json({ error: "Error handling success payment" });
  }
});
app.post("/fail", async (req, res) => {
  res.redirect("http://localhost:5173/fail");
});

app.post("/cancel", async (req, res) => {
  res.redirect("http://localhost:5173/cancel");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
