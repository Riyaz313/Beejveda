import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email"),
      phone: z.string().min(1, "Phone is required"),
      address: z.string().min(1, "Address is required"),
      address2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      pincode: z.string().min(1, "PIN code is required"),
      country: z.string().default("India"),
    }),
    paymentMethod: z.enum(["COD", "ONLINE"]).default("COD"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  }),
});
