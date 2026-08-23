import { Router } from "express";
import * as adminOrderController from "../../controllers/admin/admin.order.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateOrderStatusSchema } from "../../validators/order.validators.js";

const router = Router();

router.get("/", adminOrderController.getOrders);
router.get("/:id", adminOrderController.getOrderById);
router.patch(
  "/:id/status",
  validate(updateOrderStatusSchema),
  adminOrderController.updateOrderStatus
);

export default router;
