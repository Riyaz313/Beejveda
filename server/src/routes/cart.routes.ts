import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.patch("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
