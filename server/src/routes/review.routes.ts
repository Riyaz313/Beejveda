import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/product/:productId", reviewController.getReviewsByProduct);
router.post("/", protect, reviewController.createReview);
router.delete("/:id", protect, reviewController.deleteReview);

export default router;
