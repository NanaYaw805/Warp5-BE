import express from 'express';
import mongoose from 'mongoose';
import { signupWithEmail, signupWithPhone } from './controllers/authController';

import dotenv from 'dotenv';
import { createDeliveryType, deleteDeliveryType, getAllDeliveryTypes, updateDeliveryType } from './controllers/deliveryTypeController';
import { createDelivery, deleteDelivery, getAllDeliveries, getDeliveriesByStatus, getDeliveriesByType, getDeliveriesByUser, getDeliveryById, searchDeliveriesByLocation, updateDelivery, updateDeliveryStatus } from './controllers/deliveryController';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (_, res) => {
    res.send('Hello, World!!');
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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 
