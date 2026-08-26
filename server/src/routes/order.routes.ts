import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema } from "../validators/order.validators.js";

const router = Router();

// All order routes require authentication
router.use(protect);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);

export default router;
