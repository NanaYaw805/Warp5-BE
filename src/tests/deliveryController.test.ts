import request from "supertest";
import app from "./app";
import mongoose from "mongoose";
import Delivery from "../models/deliveryModel";
import DeliveryType from "../models/deliveryTypeModel";
import User from "../models/userModel";

describe("Delivery Controller", () => {
  let userId: string;
  let deliveryTypeId: string;
  let deliveryId: string;

  // Helper functions
  const uniqueEmail = () => `test_${Date.now()}@example.com`;
  const uniquePhone = () => `${Math.floor(Math.random() * 1e10)}`;
  const uniqueDeliveryTypeName = () => `test_delivery_type_${Date.now()}`;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);

    await Delivery.deleteMany({});
    await DeliveryType.deleteMany({});
    await User.deleteMany({});
    // Create a user
    const user = new User({ email: uniqueEmail(), phone: uniquePhone() });
    await user.save();
    userId = user._id.toString();
    // Create a delivery type
    const deliveryType = new DeliveryType({
      name: uniqueDeliveryTypeName(),
      description: "Test delivery type",
      basePrice: 10.5,
    });
    await deliveryType.save();
    deliveryTypeId = deliveryType._id.toString();
  });

  afterAll(async () => {
    await Delivery.deleteMany({});
    await DeliveryType.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /deliveries", () => {
    it("should create a new delivery with valid data", async () => {
      const deliveryData = {
        userId,
        location: "Test Location",
        weight: 2.5,
        photos: ["photo1.jpg"],
        deliveryType: deliveryTypeId,
        amount: 20.0,
        negotiable: true,
        instructions: "Handle with care",
        pickupLocation: "Warehouse 1",
      };
      const response = await request(app)
        .post("/deliveries")
        .send(deliveryData);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Delivery created successfully");
      expect(response.body.delivery).toHaveProperty("_id");
      expect(response.body.delivery.userId).toBe(userId);
      expect(response.body.delivery.deliveryType._id).toBe(deliveryTypeId);
      deliveryId = response.body.delivery._id;
    });

    it("should return error if required fields are missing", async () => {
      const response = await request(app).post("/deliveries").send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "User ID, location, weight, delivery type, amount, and pickup location are required.",
      );
    });

    it("should return error for invalid delivery type", async () => {
      const deliveryData = {
        userId,
        location: "Test Location",
        weight: 2.5,
        photos: ["photo1.jpg"],
        deliveryType: new mongoose.Types.ObjectId(),
        amount: 20.0,
        negotiable: true,
        instructions: "Handle with care",
        pickupLocation: "Warehouse 1",
      };
      const response = await request(app)
        .post("/deliveries")
        .send(deliveryData);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid delivery type");
    });
  });

  describe("GET /deliveries", () => {
    it("should get all deliveries", async () => {
      const response = await request(app).get("/deliveries");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.deliveries)).toBe(true);
    });
  });

  describe("GET /deliveries/:id", () => {
    it("should get a delivery by ID", async () => {
      const response = await request(app).get(`/deliveries/${deliveryId}`);
      expect(response.status).toBe(200);
      expect(response.body.delivery).toHaveProperty("_id", deliveryId);
    });
    it("should return 404 for non-existent delivery", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/deliveries/${fakeId}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Delivery not found");
    });
  });

  describe("GET /deliveries/user/:userId", () => {
    it("should get deliveries by user ID", async () => {
      const response = await request(app).get(`/deliveries/user/${userId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.deliveries)).toBe(true);
    });
  });

  describe("PATCH /deliveries/:id/status", () => {
    it("should update delivery status", async () => {
      const response = await request(app)
        .patch(`/deliveries/${deliveryId}/status`)
        .send({ status: "in_transit" });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Delivery status updated successfully",
      );
      expect(response.body.delivery.status).toBe("in_transit");
    });
    it("should return error if status is missing", async () => {
      const response = await request(app)
        .patch(`/deliveries/${deliveryId}/status`)
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Status is required.");
    });
    it("should return 404 for non-existent delivery", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/deliveries/${fakeId}/status`)
        .send({ status: "delivered" });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Delivery not found");
    });
  });

  describe("PUT /deliveries/:id", () => {
    it("should update delivery details", async () => {
      const response = await request(app)
        .put(`/deliveries/${deliveryId}`)
        .send({ location: "Updated Location", amount: 30.0 });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Delivery updated successfully");
      expect(response.body.delivery.location).toBe("Updated Location");
      expect(response.body.delivery.amount).toBe(30.0);
    });
    it("should return 404 for non-existent delivery", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/deliveries/${fakeId}`)
        .send({ location: "Nowhere" });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Delivery not found");
    });
    it("should return error for invalid delivery type update", async () => {
      const response = await request(app)
        .put(`/deliveries/${deliveryId}`)
        .send({ deliveryType: new mongoose.Types.ObjectId() });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid delivery type");
    });
  });

  describe("DELETE /deliveries/:id", () => {
    it("should delete a delivery", async () => {
      const response = await request(app).delete(`/deliveries/${deliveryId}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Delivery deleted successfully");
    });
    it("should return 404 for non-existent delivery", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/deliveries/${fakeId}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Delivery not found");
    });
  });

  describe("GET /deliveries/status/:status", () => {
    it("should get deliveries by status", async () => {
      // Create a delivery with status 'pending'
      const delivery = new Delivery({
        deliveryId: `DEL-${Date.now()}`,
        userId,
        location: "Status Test",
        weight: 1.0,
        deliveryType: deliveryTypeId,
        amount: 10.0,
        pickupLocation: "Loc",
        status: "pending",
      });
      await delivery.save();
      const response = await request(app).get("/deliveries/status/pending");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.deliveries)).toBe(true);
    });
  });

  describe("GET /deliveries/type/:deliveryTypeId", () => {
    it("should get deliveries by delivery type", async () => {
      const response = await request(app).get(
        `/deliveries/type/${deliveryTypeId}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.deliveries)).toBe(true);
    });
  });

  describe("GET /deliveries/search/location", () => {
    it("should search deliveries by location", async () => {
      const response = await request(app).get(
        `/deliveries/search/location?location=Status%20Test`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.deliveries)).toBe(true);
    });
    it("should return error if location query is missing", async () => {
      const response = await request(app).get(`/deliveries/search/location`);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Location query parameter is required",
      );
    });
  });
});
