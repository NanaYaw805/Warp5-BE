import { Request, Response } from "express";
import DeliveryType from "../models/deliveryTypeModel";
import { validateRequiredFields } from "../utils/validation";

// Create a new delivery type
export const createDeliveryType = async (req: Request, res: Response) => {
  const { name, description, basePrice } = req.body;

  const missing = validateRequiredFields(
    req.body,
    ["name", "description", "basePrice"],
    res,
    "Name, description, and base price are required."
  );
  if (missing) return missing;

  try {
    // Check if delivery type with same name already exists
    const existingType = await DeliveryType.findOne({ name: name.toLowerCase() });
    if (existingType) {
      return res.status(400).json({ message: "Delivery type with this name already exists" });
    }

    const deliveryType = new DeliveryType({
      name: name.toLowerCase(),
      description,
      basePrice
    });

    await deliveryType.save();
    res.status(201).json({ 
      message: "Delivery type created successfully", 
      deliveryType 
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating delivery type", error });
  }
};

// Get all delivery types
export const getAllDeliveryTypes = async (req: Request, res: Response) => {
  try {
    const deliveryTypes = await DeliveryType.find({ });
    res.status(200).json({ deliveryTypes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery types", error });
  }
};

// Update delivery type
export const updateDeliveryType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, basePrice, isActive } = req.body;

  try {
    // If name is being updated, check for duplicates
    if (name) {
      const existingType = await DeliveryType.findOne({ 
        name: name.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingType) {
        return res.status(400).json({ message: "Delivery type with this name already exists" });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.toLowerCase();
    if (description) updateData.description = description;
    if (basePrice !== undefined) updateData.basePrice = basePrice;

    const deliveryType = await DeliveryType.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!deliveryType) {
      return res.status(404).json({ message: "Delivery type not found" });
    }

    res.status(200).json({ 
      message: "Delivery type updated successfully", 
      deliveryType 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating delivery type", error });
  }
};

// Delete delivery type
export const deleteDeliveryType = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deliveryType = await DeliveryType.findByIdAndDelete(id);
    if (!deliveryType) {
      return res.status(404).json({ message: "Delivery type not found" });
    }

    res.status(200).json({ message: "Delivery type permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting delivery type", error });
  }
};
