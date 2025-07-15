import { Request, Response } from "express";
import Delivery from "../models/deliveryModel";
import DeliveryType from "../models/deliveryTypeModel";
import { validateRequiredFields } from "../utils/validation";

const generateDeliveryId = () => {
  return `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new delivery
export const createDelivery = async (req: Request, res: Response) => {
  const {
    userId,
    location,
    weight,
    photos,
    deliveryType,
    amount,
    negotiable,
    instructions,
    pickupLocation
  } = req.body;

  const missing = validateRequiredFields(
    req.body,
    ["userId", "location", "weight", "deliveryType", "amount", "pickupLocation"],
    res,
    "User ID, location, weight, delivery type, amount, and pickup location are required."
  );
  if (missing) return missing;

  try {
    // Verify delivery type exists
    const deliveryTypeExists = await DeliveryType.findById(deliveryType);
    if (!deliveryTypeExists) {
      return res.status(400).json({ message: "Invalid delivery type" });
    }

    const delivery = new Delivery({
      deliveryId: generateDeliveryId(),
      userId,
      location,
      weight,
      photos: photos || [],
      deliveryType,
      amount,
      negotiable: negotiable || false,
      instructions: instructions || "",
      pickupLocation,
      status: "pending"
    });

    await delivery.save();
    
    // Populate delivery type for response
    await delivery.populate('deliveryType', 'name description basePrice');
    
    res.status(201).json({ 
      message: "Delivery created successfully", 
      delivery: delivery 
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating delivery", error });
  }
};

// Get all deliveries
export const getAllDeliveries = async (req: Request, res: Response) => {
  try {
    const deliveries = await Delivery.find()
      .populate('userId', 'name email phone')
      .populate('deliveryType', 'name description basePrice');
    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: "Error fetching deliveries", error });
  }
};

// Get delivery by ID
export const getDeliveryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const delivery = await Delivery.findById(id)
      .populate('userId', 'name email phone')
      .populate('deliveryType', 'name description basePrice');
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.status(200).json({ delivery });
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery", error });
  }
};

// Get deliveries by user ID
export const getDeliveriesByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const deliveries = await Delivery.find({ userId })
      .populate('userId', 'name email phone')
      .populate('deliveryType', 'name description basePrice');
    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user deliveries", error });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, estimatedDeliveryDate } = req.body;

  const missing = validateRequiredFields(
    req.body,
    ["status"],
    res,
    "Status is required."
  );
  if (missing) return missing;

  try {
    const updateData: any = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = estimatedDeliveryDate;
    if (status === 'delivered') updateData.actualDeliveryDate = new Date();

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('userId', 'name email phone')
    .populate('deliveryType', 'name description basePrice');

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ 
      message: "Delivery status updated successfully", 
      delivery 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating delivery status", error });
  }
};

// Update delivery details
export const updateDelivery = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updateData.deliveryId;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  // If delivery type is being updated, verify it exists
  if (updateData.deliveryType) {
    const deliveryTypeExists = await DeliveryType.findById(updateData.deliveryType);
    if (!deliveryTypeExists) {
      return res.status(400).json({ message: "Invalid delivery type" });
    }
  }

  try {
    const delivery = await Delivery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('userId', 'name email phone')
    .populate('deliveryType', 'name description basePrice');

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ 
      message: "Delivery updated successfully", 
      delivery 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating delivery", error });
  }
};

// Delete delivery
export const deleteDelivery = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const delivery = await Delivery.findByIdAndDelete(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting delivery", error });
  }
};

// Get deliveries by status
export const getDeliveriesByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;

  try {
    const deliveries = await Delivery.find({ status })
      .populate('userId', 'name email phone')
      .populate('deliveryType', 'name description basePrice');
    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: "Error fetching deliveries by status", error });
  }
};

// Get deliveries by delivery type
export const getDeliveriesByType = async (req: Request, res: Response) => {
  const { deliveryTypeId } = req.params;

  try {
    const deliveries = await Delivery.find({ deliveryType: deliveryTypeId })
      .populate('userId', 'name email phone')
      .populate('deliveryType', 'name description basePrice');
    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: "Error fetching deliveries by type", error });
  }
};

// Search deliveries by location
export const searchDeliveriesByLocation = async (req: Request, res: Response) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ message: "Location query parameter is required" });
  }

  try {
    const deliveries = await Delivery.find({
      location: { $regex: location as string, $options: 'i' }
    })
    .populate('userId', 'name email phone')
    .populate('deliveryType', 'name description basePrice');
    res.status(200).json({ deliveries });
  } catch (error) {
    res.status(500).json({ message: "Error searching deliveries by location", error });
  }
};
