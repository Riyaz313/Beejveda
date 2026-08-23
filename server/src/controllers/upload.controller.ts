import { Response } from "express";
import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToB2, deleteFromB2 } from "../utils/b2Storage.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// POST /api/upload/product/:id — upload image for a product
export const uploadProductImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound("Product not found");

    if (!req.file) throw ApiError.badRequest("No file uploaded");

    const key = await uploadToB2(
      req.file.buffer,
      req.file.originalname,
      `products/${product.slug}`
    );

    const isPrimary = product.images.length === 0;
    product.images.push({ key, alt: req.file.originalname, isPrimary });
    await product.save();

    res.status(201).json({
      success: true,
      data: {
        key,
        alt: req.file.originalname,
        isPrimary,
      },
    });
  }
);

// DELETE /api/upload/product/:id/image/:key — delete image from product
export const deleteProductImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound("Product not found");

    const imageKey = decodeURIComponent(String(req.params.key));
    const imageIndex = product.images.findIndex((img) => img.key === imageKey);

    if (imageIndex === -1) {
      throw ApiError.notFound("Image not found on this product");
    }

    // Delete from B2
    await deleteFromB2(imageKey);

    product.images.splice(imageIndex, 1);

    // Ensure there's still a primary image
    if (product.images.length > 0 && !product.images.some((img) => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    res.json({ success: true, message: "Image deleted" });
  }
);

// POST /api/upload/category/:id — upload image for a category
export const uploadCategoryImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw ApiError.notFound("Category not found");

    if (!req.file) throw ApiError.badRequest("No file uploaded");

    // Delete old image if exists
    if (category.image) {
      await deleteFromB2(category.image).catch(() => {});
    }

    const key = await uploadToB2(
      req.file.buffer,
      req.file.originalname,
      `categories/${category.slug}`
    );

    category.image = key;
    await category.save();

    res.status(201).json({
      success: true,
      data: { key },
    });
  }
);

// DELETE /api/upload/category/:id/image — delete category image
export const deleteCategoryImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw ApiError.notFound("Category not found");

    if (!category.image) {
      throw ApiError.notFound("No image to delete");
    }

    await deleteFromB2(category.image);
    category.image = undefined;
    await category.save();

    res.json({ success: true, message: "Image deleted" });
  }
);
