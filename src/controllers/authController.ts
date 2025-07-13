import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Auth from "../models/authModel";
import User from "../models/userModel";
import { validateRequiredFields } from "../utils/validation";

const createAuth = async (
  identifier: string,
  password: string,
  type: "email" | "phone",
) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const auth = new Auth({ identifier, password: hashedPassword, type });
  await auth.save();
};

const createUser = async (email: string, phone: string, name: string) => {
  const user = new User({ email, phone, name });
  await user.save();
};

const checkExistingAuth = async (identifier: string) => {
  return await Auth.findOne({ identifier: identifier.toLowerCase() });
};

// Signup with email controller
export const signupWithEmail = async (req: Request, res: Response) => {
  const { email, phone, password, name } = req.body;
  const missing = validateRequiredFields(
    req.body,
    ["email", "phone", "password", "name"],
    res,
    "Email, phone, password, and name are required.",
  );
  if (missing) return missing;

  const formattedEmail = email.toLowerCase();
  try {
    const existingAuth = await checkExistingAuth(formattedEmail);
    if (existingAuth) {
      return res.status(400).json({ message: "User already exists" });
    }

    await createAuth(formattedEmail, password, "email");
    await createUser(formattedEmail, phone, name);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// Signup with phone controller
export const signupWithPhone = async (req: Request, res: Response) => {
  const { email, phone, password, name } = req.body;
  const missing = validateRequiredFields(
    req.body,
    ["email", "phone", "password", "name"],
    res,
    "Email, phone, password, and name are required.",
  );
  if (missing) return missing;

  try {
    const existingAuth = await checkExistingAuth(phone);
    if (existingAuth) {
      return res.status(400).json({ message: "User already exists" });
    }

    await createAuth(phone, password, "phone");
    await createUser(email, phone, name);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};
