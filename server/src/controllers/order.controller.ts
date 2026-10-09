import { Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product, { deriveVariantDisplayLabel } from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { sendOrderPlacedEmail } from "../utils/email.js";

// POST /api/orders — create order from cart
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { shippingAddress, paymentMethod = "COD" } = req.body;

    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Cart is empty");
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const orderItems = [];
      let itemsTotal = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product).session(session);
        if (!product) throw ApiError.notFound(`Product not found: ${cartItem.product}`);

        const variant = (product.variants as any).id(cartItem.variantId);
        if (!variant) throw ApiError.notFound("Variant not found");

        const displayLabel = deriveVariantDisplayLabel(variant);

        if (variant.stock < cartItem.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for ${product.name} (${displayLabel}) — only ${variant.stock} available`
          );
        }

        const updateQuery: any = {
          _id: product._id,
          "variants._id": variant._id,
          "variants.stock": { $gte: cartItem.quantity },
        };
        const updateOptions: any = { new: true, session };

        const updateResult = await Product.findOneAndUpdate(
          updateQuery,
          { $inc: { "variants.$.stock": -cartItem.quantity } },
          updateOptions
        );

        if (!updateResult) {
          throw ApiError.badRequest(
            `Stock changed for ${product.name} (${displayLabel}) — please try again`
          );
        }

        const unitPrice = variant.price;
        const lineTotal = unitPrice * cartItem.quantity;
        itemsTotal += lineTotal;

        const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

        orderItems.push({
          product: product._id,
          name: product.name,
          imageKey: primaryImage?.key,
          variant: {
            unitType: variant.unitType,
            value: variant.value,
            unit: variant.unit,
            displayLabel,
          },
          unitPrice,
          quantity: cartItem.quantity,
          lineTotal,
        });
      }

      const shippingFee = itemsTotal >= 999 ? 0 : 99;
      const grandTotal = itemsTotal + shippingFee;

      const [order] = await Order.create(
        [
          {
            user: req.user!._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            itemsTotal,
            shippingFee,
            grandTotal,
          },
        ],
        { session }
      );

      cart.items = [];
      await cart.save({ session });

      await session.commitTransaction();

      const hydratedOrder = await Order.findById(order._id).populate("user", "name email");
      if (hydratedOrder) {
        await sendOrderPlacedEmail(hydratedOrder as any);
      }

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

// GET /api/orders — current user's orders
export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orders = await Order.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name slug images");

    res.json({ success: true, data: orders });
  }
);

// GET /api/orders/:id
export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name slug images")
      .populate("user", "name email");

    if (!order) throw ApiError.notFound("Order not found");

    // Only owner or admin can view
    if (
      order.user._id.toString() !== req.user!._id &&
      req.user!.role !== "admin"
    ) {
      throw ApiError.forbidden("Not authorized to view this order");
    }

    res.json({ success: true, data: order });
  }
);
