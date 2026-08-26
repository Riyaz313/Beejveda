import { Router } from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// All upload routes require admin auth
router.use(protect, adminOnly);

// Product image upload
router.post(
  "/product/:id",
  upload.single("image"),
  uploadController.uploadProductImage
);
router.delete(
  "/product/:id/image/:key",
  uploadController.deleteProductImage
);

// Category image upload
router.post(
  "/category/:id",
  upload.single("image"),
  uploadController.uploadCategoryImage
);
router.delete(
  "/category/:id/image",
  uploadController.deleteCategoryImage
);

export default router;
