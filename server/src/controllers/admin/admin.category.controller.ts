import { Request, Response } from "express";
import Category from "../../models/Category.model.js";
import Product from "../../models/Product.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slugify.js";

// POST /api/admin/categories
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug: inputSlug, description, image } = req.body;

  const slug = inputSlug || slugify(name);

  const existing = await Category.findOne({ slug });
  if (existing) throw ApiError.conflict("Category with this slug already exists");

  const category = await Category.create({
    name,
    slug,
    description,
    image,
  });

  res.status(201).json({ success: true, data: category });
});

// GET /api/admin/categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id });
      return { ...cat.toObject(), productCount: count };
    })
  );

  res.json({ success: true, data: categoriesWithCount });
});

// GET /api/admin/categories/:id
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  const count = await Product.countDocuments({ category: category._id });

  res.json({ success: true, data: { ...category.toObject(), productCount: count } });
});

// PATCH /api/admin/categories/:id
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  if (req.body.name && !req.body.slug) {
    req.body.slug = slugify(req.body.name);
  }

  if (req.body.slug && req.body.slug !== category.slug) {
    const existing = await Category.findOne({ slug: req.body.slug });
    if (existing) throw ApiError.conflict("Slug already in use");
  }

  Object.assign(category, req.body);
  await category.save();

  res.json({ success: true, data: category });
});

// DELETE /api/admin/categories/:id
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category — it has ${productCount} product(s). Reassign them first.`
    );
  }

  await Category.findByIdAndDelete(category._id);
  res.json({ success: true, message: "Category deleted" });
});
