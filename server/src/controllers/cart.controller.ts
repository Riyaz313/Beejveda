import { Response } from "express";
import mongoose from "mongoose";
import Cart, { type ICartItem } from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getSignedImageUrl } from "../utils/b2Storage.js";

function consolidateDuplicateItems(items: ICartItem[]): ICartItem[] | null {
  const itemsByIdentity = new Map<string, ICartItem>();
  for (const item of items) {
    const key = `${item.product.toString()}:${item.variantId.toString()}`;
    const existing = itemsByIdentity.get(key);
    if (existing) existing.quantity += item.quantity;
    else {
      itemsByIdentity.set(key, {
        product: item.product,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }

  return itemsByIdentity.size === items.length
    ? null
    : Array.from(itemsByIdentity.values());
}

// GET /api/cart
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  let cart = await Cart.findOne({ user: req.user!._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user!._id, items: [] });
  }

  const consolidatedItems = consolidateDuplicateItems(cart.items);
  if (consolidatedItems) {
    cart.items = consolidatedItems;
    await cart.save();
  }

  // Populate each item with live product/variant data
  const populatedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) return null;

      const variant = (product.variants as any).id(item.variantId);
      if (!variant) return null;

      const images = await Promise.all(
        product.images.map(async (image) => ({
          key: image.key,
          alt: image.alt,
          isPrimary: image.isPrimary,
          url: await getSignedImageUrl(image.key),
        }))
      );

      return {
        _id: (item as any)._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images,
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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw ApiError.badRequest("Invalid product ID");
    }
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw ApiError.badRequest("Invalid variant ID");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw ApiError.badRequest("Quantity must be a positive integer");
    }

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

    const consolidatedItems = consolidateDuplicateItems(cart.items);
    if (consolidatedItems) cart.items = consolidatedItems;

    // Compare canonical ObjectIds so request string formatting cannot split identity.
    const existingItem = cart.items.find(
      (item) =>
        item.product.equals(product._id) &&
        item.variantId.equals(variant._id)
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (variant.stock < newQty) {
        throw ApiError.badRequest(
          `Insufficient stock — only ${variant.stock} available`
        );
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        product: product._id,
        variantId: variant._id,
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
