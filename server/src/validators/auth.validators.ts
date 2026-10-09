import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
    phone: z.string().trim().max(30, "Phone number is too long").optional(),
    addresses: z.array(
      z.object({
        label: z.string().optional(),
        address: z.string().min(1, "Address is required"),
        address2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(1, "Pincode is required"),
        country: z.string().min(1, "Country is required").default("India"),
        isDefault: z.boolean().optional(),
      })
    ).optional(),
  }),
});
