import request from "supertest";
import app from "./app";

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Auth Controller", () => {
  const uniqueEmail = () => `test_${Date.now()}@example.com`;
  const uniquePhone = () => `${Math.floor(Math.random() * 1e10)}`;

  it("should signup a user with email", async () => {
    const response = await request(app)
      .post("/signup/email")
      .send({ 
        email: uniqueEmail(), 
        phone: uniquePhone(),
        password: "password123",
        name: "Test User"
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  it("should return error if user already exists", async () => {
    const email = "test_already_exists@example.com";
    const phone = uniquePhone();
    await request(app)
      .post("/signup/email")
      .send({ 
        email, 
        phone,
        password: "password123",
        name: "Test User"
      }); // Create user first
    const response = await request(app)
      .post("/signup/email")
      .send({ 
        email, 
        phone,
        password: "password123",
        name: "Test User"
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should signup a user with phone", async () => {
    const response = await request(app)
      .post("/signup/phone")
      .send({ 
        email: uniqueEmail(),
        phone: uniquePhone(), 
        password: "password123",
        name: "Test User"
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  it("should return error if phone user already exists", async () => {
    const email = uniqueEmail();
    const phone = "9999999999";
    await request(app)
      .post("/signup/phone")
      .send({ 
        email,
        phone, 
        password: "password123",
        name: "Test User"
      }); // Create user first
    const response = await request(app)
      .post("/signup/phone")
      .send({ 
        email,
        phone, 
        password: "password123",
        name: "Test User"
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should return error if required fields are missing for email signup", async () => {
    let response = await request(app)
      .post("/signup/email")
      .send({ 
        email: "missing_fields@example.com",
        phone: uniquePhone(),
        name: "Test User"
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email, phone, password, and name are required.");

    response = await request(app)
      .post("/signup/email")
      .send({ 
        email: "missing_fields@example.com",
        phone: uniquePhone(),
        password: "password123"
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email, phone, password, and name are required.");
  });

  it("should return error if required fields are missing for phone signup", async () => {
    let response = await request(app)
      .post("/signup/phone")
      .send({ 
        email: uniqueEmail(),
        phone: "8888888888",
        name: "Test User"
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email, phone, password, and name are required.");

    response = await request(app)
      .post("/signup/phone")
      .send({ 
        email: uniqueEmail(),
        phone: "8888888888",
        password: "password123"
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email, phone, password, and name are required.");
  });
});
