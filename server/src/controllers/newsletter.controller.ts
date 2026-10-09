import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Subscriber from "../models/Subscriber.model.js";
import { sendOfferEmail } from "../utils/email.js";

export const subscribeToNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    throw ApiError.badRequest("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  let subscriber = await Subscriber.findOne({ email: normalizedEmail });

  if (!subscriber) {
    subscriber = await Subscriber.create({ email: normalizedEmail });
  }

  await sendOfferEmail({
    to: normalizedEmail,
    name: normalizedEmail.split("@")[0],
    title: "Welcome to BeejVeda updates",
    message:
      "Thanks for subscribing. You'll now receive product updates, wellness tips, and special offers from BeejVeda.",
  });

  res.status(200).json({
    success: true,
    message: "You are subscribed successfully.",
    data: { email: subscriber.email },
  });
});
