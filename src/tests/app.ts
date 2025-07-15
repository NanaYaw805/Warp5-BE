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
import {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  getDeliveriesByUser,
  updateDeliveryStatus,
  updateDelivery,
  deleteDelivery,
  getDeliveriesByStatus,
  getDeliveriesByType,
  searchDeliveriesByLocation,
} from "../controllers/deliveryController";

import dotenv from "dotenv";
dotenv.config();


const app = express();

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

// Delivery routes
app.post("/deliveries", createDelivery);
app.get("/deliveries", getAllDeliveries);
app.get("/deliveries/:id", getDeliveryById);
app.get("/deliveries/user/:userId", getDeliveriesByUser);
app.patch("/deliveries/:id/status", updateDeliveryStatus);
app.put("/deliveries/:id", updateDelivery);
app.delete("/deliveries/:id", deleteDelivery);
app.get("/deliveries/status/:status", getDeliveriesByStatus);
app.get("/deliveries/type/:deliveryTypeId", getDeliveriesByType);
app.get("/deliveries/search/location", searchDeliveriesByLocation);


export default app;
