import { Response } from "express";

// Utility to check required fields
export const validateRequiredFields = (
  fields: Record<string, any>,
  required: string[],
  res: Response,
  message: string,
) => {
  for (const field of required) {
    if (!fields[field]) {
      return res.status(400).json({ message });
    }
  }
  return null;
}; 