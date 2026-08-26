import { Router } from "express";
import * as adminProductController from "../../controllers/admin/admin.product.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
} from "../../validators/product.validators.js";

const router = Router();

// Product CRUD
router.post("/", validate(createProductSchema), adminProductController.createProduct);
router.get("/", adminProductController.getProducts);
router.get("/:id", adminProductController.getProductById);
router.patch("/:id", validate(updateProductSchema), adminProductController.updateProduct);
router.delete("/:id", adminProductController.deleteProduct);

// Variant management
router.post("/:id/variants", validate(createVariantSchema), adminProductController.addVariant);
router.patch("/:id/variants/:variantId", validate(updateVariantSchema), adminProductController.updateVariant);
router.delete("/:id/variants/:variantId", adminProductController.deleteVariant);

export default router;
