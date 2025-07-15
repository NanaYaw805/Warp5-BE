import mongoose from "mongoose";

const deliveryTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
  },
  { timestamps: true },
);

const DeliveryType = mongoose.model("DeliveryType", deliveryTypeSchema);

export default DeliveryType;
