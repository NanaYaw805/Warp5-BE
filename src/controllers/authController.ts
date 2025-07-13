import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

const createUser = async (
  email: string | null,
  phone: string | null,
  password: string,
) => {
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ email, phone, password: hashedPassword });
  await newUser.save();
};

const checkExistingUser = async (
  email: string | null,
  phone: string | null,
) => {
  if (email) {
    return await User.findOne({ email });
  }
  if (phone) {
    return await User.findOne({ phone });
  }
  return null;
};

// Signup with email controller
export const signupWithEmail = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const existingUser = await checkExistingUser(email, null);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        await createUser(email, null, password);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Signup with phone controller
export const signupWithPhone = async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.status(400).json({ message: 'Phone and password are required.' });
    }
    try {
        const existingUser = await checkExistingUser(null, phone);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        await createUser(null, phone, password);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};
