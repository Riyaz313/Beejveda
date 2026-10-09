import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendContactUsEmail } from "../utils/email.js";

export const submitContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  const result = await sendContactUsEmail({
    name,
    email,
    phone,
    subject,
    message,
  });

  if (!result.ok) {
    const message =
      result.message === "EMAIL_NOT_CONFIGURED"
        ? "Email service is not configured. Add a valid Resend API key and verified FROM_EMAIL in the server .env file."
        : "Your message could not be sent. Please try again later.";

    res.status(500).json({
      success: false,
      message,
      details: result.details || null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Your message has been sent successfully.",
  });
});
