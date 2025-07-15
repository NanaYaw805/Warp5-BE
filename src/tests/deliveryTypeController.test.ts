import request from "supertest";
import app from "./app";
import mongoose from "mongoose";
import DeliveryType from "../models/deliveryTypeModel";

describe("Delivery Type Controller", () => {
  let createdDeliveryTypeId: string;

  // Helper function to generate unique delivery type names
  const uniqueDeliveryTypeName = () => `test_delivery_type_${Date.now()}`;

  // Clean up database before and after tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    await DeliveryType.deleteMany({});
  });

  afterAll(async () => {
    await DeliveryType.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /delivery-types", () => {
    it("should create a new delivery type with valid data", async () => {
      const deliveryTypeData = {
        name: uniqueDeliveryTypeName(),
        description: "Test delivery type description",
        basePrice: 25.5,
      };

      const response = await request(app)
        .post("/delivery-types")
        .send(deliveryTypeData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Delivery type created successfully");
      expect(response.body.deliveryType).toHaveProperty("_id");
      expect(response.body.deliveryType.name).toBe(
        deliveryTypeData.name.toLowerCase(),
      );
      expect(response.body.deliveryType.description).toBe(
        deliveryTypeData.description,
      );
      expect(response.body.deliveryType.basePrice).toBe(
        deliveryTypeData.basePrice,
      );
      // Store the ID for later tests
      createdDeliveryTypeId = response.body.deliveryType._id;
    });

    it("should return error if name is missing", async () => {
      const deliveryTypeData = {
        description: "Test delivery type description",
        basePrice: 25.5,
      };

      const response = await request(app)
        .post("/delivery-types")
        .send(deliveryTypeData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Name, description, and base price are required.",
      );
    });

    it("should return error if description is missing", async () => {
      const deliveryTypeData = {
        name: uniqueDeliveryTypeName(),
        basePrice: 25.5,
      };

      const response = await request(app)
        .post("/delivery-types")
        .send(deliveryTypeData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Name, description, and base price are required.",
      );
    });

    it("should return error if basePrice is missing", async () => {
      const deliveryTypeData = {
        name: uniqueDeliveryTypeName(),
        description: "Test delivery type description",
      };

      const response = await request(app)
        .post("/delivery-types")
        .send(deliveryTypeData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Name, description, and base price are required.",
      );
    });

    it("should return error if delivery type with same name already exists", async () => {
      const name = uniqueDeliveryTypeName();
      const deliveryTypeData = {
        name,
        description: "First delivery type",
        basePrice: 25.5,
      };

      // Create first delivery type
      await request(app).post("/delivery-types").send(deliveryTypeData);

      // Try to create second delivery type with same name
      const response = await request(app).post("/delivery-types").send({
        name,
        description: "Second delivery type",
        basePrice: 30.0,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Delivery type with this name already exists",
      );
    });

    it("should convert name to lowercase", async () => {
      const deliveryTypeData = {
        name: "UPPERCASE_NAME",
        description: "Test delivery type description",
        basePrice: 25.5,
      };

      const response = await request(app)
        .post("/delivery-types")
        .send(deliveryTypeData);

      expect(response.status).toBe(201);
      expect(response.body.deliveryType.name).toBe("uppercase_name");
    });
  });

  describe("GET /delivery-types", () => {
    it("should get all delivery types", async () => {
      // Create a few delivery types first
      const deliveryType1 = {
        name: uniqueDeliveryTypeName(),
        description: "First test delivery type",
        basePrice: 20.0,
      };

      const deliveryType2 = {
        name: uniqueDeliveryTypeName(),
        description: "Second test delivery type",
        basePrice: 30.0,
      };

      await request(app).post("/delivery-types").send(deliveryType1);
      await request(app).post("/delivery-types").send(deliveryType2);

      const response = await request(app).get("/delivery-types");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("deliveryTypes");
      expect(Array.isArray(response.body.deliveryTypes)).toBe(true);
      expect(response.body.deliveryTypes.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty array when no delivery types exist", async () => {
      // Clear all delivery types
      await DeliveryType.deleteMany({});

      const response = await request(app).get("/delivery-types");

      expect(response.status).toBe(200);
      expect(response.body.deliveryTypes).toEqual([]);
    });
  });

  describe("DELETE /delivery-types/:id", () => {
    beforeEach(async () => {
      // Create a delivery type for testing deletion
      const deliveryTypeData = {
        name: uniqueDeliveryTypeName(),
        description: "Test delivery type for deletion",
        basePrice: 25.0,
      };

      const response = await request(app)
        .post("/delivery-types")
        .send(deliveryTypeData);

      createdDeliveryTypeId = response.body.deliveryType._id;
    });

    it("should delete delivery type successfully", async () => {
      const response = await request(app).delete(
        `/delivery-types/${createdDeliveryTypeId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Delivery type permanently deleted");

      // Verify it's actually deleted
      const getResponse = await request(app).get("/delivery-types");
      const deletedType = getResponse.body.deliveryTypes.find(
        (type: any) => type._id === createdDeliveryTypeId,
      );
      expect(deletedType).toBeUndefined();
    });

    it("should return error if delivery type not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/delivery-types/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Delivery type not found");
    });

    it("should return error for invalid ID format", async () => {
      const response = await request(app).delete("/delivery-types/invalid-id");

      expect(response.status).toBe(500);
    });
  });
});
