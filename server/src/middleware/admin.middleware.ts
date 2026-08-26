import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";

export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    return next(ApiError.forbidden("Admin access required"));
  }
  next();
};
