import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.model.js";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw ApiError.unauthorized("Not authorized — no token");
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select(
      "_id name email role"
    );

    if (!user) {
      throw ApiError.unauthorized("Not authorized — user not found");
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized("Not authorized"));
    }
  }
};
