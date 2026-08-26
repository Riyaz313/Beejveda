import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues,
    });
    return;
  }

  // Operational errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors || {})
      .map((e: any) => e.message)
      .join(", ");
    res.status(400).json({
      success: false,
      message: `Validation error: ${message}`,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Unknown error
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
