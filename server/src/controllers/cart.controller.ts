import { Response } from "express";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// GET /api/cart
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  let cart = await Cart.findOne({ user: req.user!._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user!._id, items: [] });
  }

  // Populate each item with live product/variant data
  const populatedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) return null;

      const variant = (product.variants as any).id(item.variantId);
      if (!variant) return null;

      return {
        _id: (item as any)._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images,
          category: product.category,
        },
        variant: {
          _id: variant._id,
          unitType: variant.unitType,
          value: variant.value,
          unit: variant.unit,
          displayLabel: variant.displayLabel,
          price: variant.price,
          originalPrice: variant.originalPrice,
          stock: variant.stock,
          inStock: variant.stock > 0,
        },
        quantity: item.quantity,
        lineTotal: variant.price * item.quantity,
      };
    })
  );

  const filteredItems = populatedItems.filter(Boolean);
  const total = filteredItems.reduce(
    (sum: number, item: any) => sum + item.lineTotal,
    0
  );
  const itemCount = filteredItems.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  res.json({
    success: true,
    data: { items: filteredItems, total, itemCount },
  });
});

// POST /api/cart/items
export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound("Product not found");

    const variant = (product.variants as any).id(variantId);
    if (!variant) throw ApiError.notFound("Variant not found");

    if (variant.stock < quantity) {
      throw ApiError.badRequest(`Insufficient stock for ${variant.displayLabel}`);
    }

    let cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user!._id, items: [] });
    }

    // Check if same product+variant already in cart
    const existingIndex = cart.items.findIndex(
      (i) =>
        i.product.toString() === productId &&
        i.variantId.toString() === variantId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (variant.stock < newQty) {
        throw ApiError.badRequest(
          `Insufficient stock — only ${variant.stock} available`
        );
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        variantId,
        quantity,
      });
    }

    await cart.save();

    res.json({ success: true, message: "Item added to cart" });
  }
);

// PATCH /api/cart/items/:itemId
export const updateCartItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) throw ApiError.notFound("Cart not found");

    const item = (cart.items as any).id(req.params.itemId);
    if (!item) throw ApiError.notFound("Cart item not found");

    // Validate stock
    const product = await Product.findById(item.product);
    if (!product) throw ApiError.notFound("Product not found");
    const variant = (product.variants as any).id(item.variantId);
    if (!variant) throw ApiError.notFound("Variant not found");
    if (variant.stock < quantity) {
      throw ApiError.badRequest(
        `Insufficient stock — only ${variant.stock} available`
      );
    }

    if (quantity <= 0) {
      (cart.items as any).pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({ success: true, message: "Cart updated" });
  }
);

// DELETE /api/cart/items/:itemId
export const removeFromCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) throw ApiError.notFound("Cart not found");

    const item = (cart.items as any).id(req.params.itemId);
    if (!item) throw ApiError.notFound("Cart item not found");

    (cart.items as any).pull(req.params.itemId);
    await cart.save();

    res.json({ success: true, message: "Item removed from cart" });
  }
);

// DELETE /api/cart
export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const cart = await Cart.findOne({ user: req.user!._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ success: true, message: "Cart cleared" });
  }
);
