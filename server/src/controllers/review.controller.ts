import { Response } from "express";
import Review from "../models/Review.model.js";
import Product from "../models/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// GET /api/reviews/product/:productId
export const getReviewsByProduct = asyncHandler(
  async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  }
);

// POST /api/reviews
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { product: productId, rating, comment } = req.body;

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    // Check for duplicate review
    const existing = await Review.findOne({
      product: productId,
      user: req.user!._id,
    });

    if (existing) {
      throw ApiError.conflict("You have already reviewed this product");
    }

    const review = await Review.create({
      product: productId,
      user: req.user!._id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: review });
  }
);

// DELETE /api/reviews/:id
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw ApiError.notFound("Review not found");
    }

    if (review.user.toString() !== req.user!._id) {
      throw ApiError.forbidden("Not authorized to delete this review");
    }

    await Review.findOneAndDelete({ _id: review._id });

    // Update product ratings
    await (Review as any).calcAverageRatings(review.product);

    res.json({ success: true, message: "Review deleted" });
  }
);
