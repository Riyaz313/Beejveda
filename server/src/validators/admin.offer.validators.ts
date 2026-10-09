import { z } from "zod";

export const adminOfferSchema = z.object({
  body: z.object({
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    includeSubscribers: z.boolean().optional().default(true),
  }),
});
