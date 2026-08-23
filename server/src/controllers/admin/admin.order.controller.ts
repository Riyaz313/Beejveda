import { Request, Response } from "express";
import Order from "../../models/Order.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// GET /api/admin/orders
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, userId, page = 1, limit = 20, from, to } = req.query as any;

  const filter: any = {};

  if (status) filter.status = status;
  if (userId) filter.user = userId;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/admin/orders/:id
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.product", "name slug");

  if (!order) throw ApiError.notFound("Order not found");

  res.json({ success: true, data: order });
});

// PATCH /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found");

  order.status = status;

  // Auto-update payment status for delivered orders
  if (status === "delivered" && order.paymentMethod === "COD") {
    order.paymentStatus = "paid";
  }

  await order.save();

  res.json({ success: true, data: order });
});
