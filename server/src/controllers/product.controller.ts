import { Request, Response } from "express";
import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getSignedImageUrl } from "../utils/b2Storage.js";

/**
 * Attach presigned image URLs to products/categories.
 */
async function signProductImages(product: any) {
  const signed = { ...product.toObject ? product.toObject() : product };
  if (signed.images && signed.images.length > 0) {
    signed.images = await Promise.all(
      signed.images.map(async (img: any) => ({
        ...img,
        url: await getSignedImageUrl(img.key),
      }))
    );
  }
  return signed;
}

// GET /api/products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    unitType,
    sort,
    page = 1,
    limit = 20,
  } = req.query as any;

  const filter: any = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { benefits: { $regex: search, $options: "i" } },
    ];
  }

  // Price filter works on variants
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: any = {};
    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
    filter["variants.price"] = priceFilter;
  }

  if (unitType) {
    filter["variants.unitType"] = unitType;
  }

  // Sort
  let sortOption: any = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { "variants.price": 1 };
  else if (sort === "price_desc") sortOption = { "variants.price": -1 };
  else if (sort === "rating") sortOption = { ratingsAverage: -1 };
  else if (sort === "name") sortOption = { name: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  // Sign images
  const signedProducts = await Promise.all(products.map(signProductImages));

  res.json({
    success: true,
    data: {
      products: signedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/products/:slug
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category", "name slug description image");

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    const signed = await signProductImages(product);

    // Sign category image too
    if (signed.category && (signed.category as any).image) {
      (signed.category as any).imageUrl = await getSignedImageUrl(
        (signed.category as any).image
      );
    }

    res.json({ success: true, data: signed });
  }
);

// GET /api/categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  // Compute productCount live
  const ProductModel = Product;
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await ProductModel.countDocuments({
        category: cat._id,
        isActive: true,
      });
      const catObj = cat.toObject() as any;
      // Sign category image
      if (catObj.image) {
        catObj.imageUrl = await getSignedImageUrl(catObj.image);
      }
      return { ...catObj, productCount: count };
    })
  );

  res.json({
    success: true,
    data: categoriesWithCount,
  });
});

// GET /api/categories/:slug
export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    const count = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    const catObj = category.toObject() as any;
    if (catObj.image) {
      catObj.imageUrl = await getSignedImageUrl(catObj.image);
    }

    res.json({ success: true, data: { ...catObj, productCount: count } });
  }
);


