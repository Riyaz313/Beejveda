import { Request, Response } from "express";
import User from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// GET /api/admin/users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, role, page = 1, limit = 20 } = req.query as any;

  const filter: any = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      users,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// PATCH /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!["customer", "admin"].includes(role)) {
    throw ApiError.badRequest("Invalid role");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");

  // Guard against demoting the last remaining admin
  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw ApiError.badRequest("Cannot demote the last remaining admin");
    }
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
