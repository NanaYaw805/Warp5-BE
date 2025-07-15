import express from "express";
import mongoose from "mongoose";
import {
  signupWithEmail,
  signupWithPhone,
} from "../controllers/authController";
import {
  createDeliveryType,
  getAllDeliveryTypes,
  updateDeliveryType,
  deleteDeliveryType,
} from "../controllers/deliveryTypeController";

import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!!");
});

// Auth routes
app.post("/signup/email", signupWithEmail);
app.post("/signup/phone", signupWithPhone);

// Delivery type routes
app.post("/delivery-types", createDeliveryType);
app.get("/delivery-types", getAllDeliveryTypes);
app.put("/delivery-types/:id", updateDeliveryType);
app.delete("/delivery-types/:id", deleteDeliveryType);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
