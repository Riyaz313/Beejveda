import { Request, Response } from "express";
import Product from "../../models/Product.model.js";
import Order from "../../models/Order.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slugify.js";
import { deleteFromB2 } from "../../utils/b2Storage.js";

// POST /api/admin/products
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { variants, ...rest } = req.body;

  const slug = rest.slug || slugify(rest.name);

  // Check slug uniqueness
  const existing = await Product.findOne({ slug });
  if (existing) throw ApiError.conflict("Product with this slug already exists");

  // Validate variant unit types
  if (variants && variants.length > 0) {
    // Check for duplicate variants
    const seen = new Set<string>();
    for (const v of variants) {
      const key = `${v.unitType}-${v.value}-${v.unit}`;
      if (seen.has(key)) {
        throw ApiError.badRequest(
          `Duplicate variant: ${v.value} ${v.unit} (${v.unitType})`
        );
      }
      seen.add(key);
    }
  }

  const product = await Product.create({
    ...rest,
    slug,
    variants: variants || [],
  });

  res.status(201).json({ success: true, data: product });
});

// GET /api/admin/products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, isActive, page = 1, limit = 20 } = req.query as any;

  const filter: any = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (category) filter.category = category;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/admin/products/:id
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug"
  );
  if (!product) throw ApiError.notFound("Product not found");
  res.json({ success: true, data: product });
});

// PATCH /api/admin/products/:id
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");

  // If name changed and no explicit slug, regenerate slug
  if (req.body.name && !req.body.slug) {
    req.body.slug = slugify(req.body.name);
  }

  // Check slug uniqueness if being changed
  if (req.body.slug && req.body.slug !== product.slug) {
    const existing = await Product.findOne({ slug: req.body.slug });
    if (existing) throw ApiError.conflict("Slug already in use");
  }

  Object.assign(product, req.body);
  await product.save();

  res.json({ success: true, data: product });
});

// DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");

  // Hard delete
  if (req.query.hard === "true") {
    // Check if referenced in open orders
    const openOrders = await Order.countDocuments({
      "items.product": product._id,
      status: { $in: ["pending", "confirmed", "processing"] },
    });
    if (openOrders > 0) {
      throw ApiError.conflict(
        "Cannot delete — product is referenced in open orders"
      );
    }

    // Delete B2 images
    for (const img of product.images) {
      await deleteFromB2(img.key).catch(() => {});
    }

    await Product.findByIdAndDelete(product._id);
    res.json({ success: true, message: "Product permanently deleted" });
  } else {
    // Soft delete
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: "Product deactivated" });
  }
});

// POST /api/admin/products/:id/variants
export const addVariant = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");

  const { unitType, value, unit } = req.body;

  // Check for duplicate variant
  const duplicate = product.variants.find(
    (v) => v.unitType === unitType && v.value === value && v.unit === unit
  );
  if (duplicate) {
    throw ApiError.conflict(
      `Variant ${value} ${unit} (${unitType}) already exists`
    );
  }

  product.variants.push(req.body);
  await product.save();

  res.status(201).json({
    success: true,
    data: product.variants[product.variants.length - 1],
  });
});

// PATCH /api/admin/products/:id/variants/:variantId
export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");

  const variant = (product.variants as any).id(req.params.variantId);
  if (!variant) throw ApiError.notFound("Variant not found");

  Object.assign(variant, req.body);
  await product.save();

  res.json({ success: true, data: variant });
});

// DELETE /api/admin/products/:id/variants/:variantId
export const deleteVariant = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");

  if (product.variants.length <= 1) {
    throw ApiError.badRequest(
      "Cannot delete the last variant — product must have at least one"
    );
  }

  // Check if referenced in open orders
  const variantId = req.params.variantId;
  const openOrders = await Order.countDocuments({
    "items.product": product._id,
    "items.variant.unitType": (product.variants as any).id(variantId)?.unitType,
    status: { $in: ["pending", "confirmed", "processing"] },
  });
  if (openOrders > 0) {
    throw ApiError.conflict(
      "Cannot delete variant — it is referenced in open orders"
    );
  }

  (product.variants as any).pull(variantId);
  await product.save();

  res.json({ success: true, message: "Variant deleted" });
});
