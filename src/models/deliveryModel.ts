import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    // Basic delivery info
    deliveryId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Delivery details
    location: { type: String, required: true }, // delivery location
    weight: { type: Number, required: true }, // in kg
    photos: [{ type: String }], // array of photo URLs
    deliveryType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryType",
      required: true,
    },

    // Pricing
    amount: { type: Number, required: true }, // delivery amount in USD
    negotiable: { type: Boolean, default: false },

    // Additional info
    instructions: { type: String }, // delivery instructions
    pickupLocation: { type: String, required: true },

    // Status and tracking
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },
    trackingNumber: { type: String, unique: true, sparse: true },

    // Timestamps
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
