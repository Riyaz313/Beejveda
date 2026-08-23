import { Request, Response, NextFunction } from "express";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

function signTokens(user: { _id: any; role: string }) {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
}

// POST /api/auth/register
export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = signTokens(user);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  }
);

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const { accessToken, refreshToken } = signTokens(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out" });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
    },
  });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized("No refresh token");
  }

  try {
    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    throw ApiError.unauthorized("Invalid refresh token");
  }
});
