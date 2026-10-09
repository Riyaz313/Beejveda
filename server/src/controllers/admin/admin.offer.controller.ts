import { Request, Response } from "express";
import User from "../../models/User.model.js";
import Subscriber from "../../models/Subscriber.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendOfferCampaign } from "../../utils/email.js";

export const sendOfferCampaignToUsers = asyncHandler(async (req: Request, res: Response) => {
  const { subject, message, includeSubscribers = true } = req.body;

  if (!subject || !message) {
    throw ApiError.badRequest("Subject and message are required");
  }

  const users = await User.find({}, "email name").lean();
  const subscribers = includeSubscribers ? await Subscriber.find({ isActive: true }, "email").lean() : [];

  const emailSet = new Set<string>();

  users.forEach((user) => {
    if (user.email) emailSet.add(String(user.email).trim().toLowerCase());
  });

  subscribers.forEach((subscriber) => {
    if (subscriber.email) emailSet.add(String(subscriber.email).trim().toLowerCase());
  });

  const recipients = Array.from(emailSet);

  if (recipients.length === 0) {
    throw ApiError.badRequest("No subscribers or users available for this campaign");
  }

  const result = await sendOfferCampaign({
    to: recipients,
    subject,
    message,
  });

  res.status(200).json({
    success: result.ok,
    message: result.ok ? "Campaign sent successfully." : "Campaign could not be sent.",
    data: {
      recipients: recipients.length,
      failed: result.failed?.length || 0,
      details: result.details,
    },
  });
});
