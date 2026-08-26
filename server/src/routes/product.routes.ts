import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

const router = Router();

router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);
router.get("/categories/:slug", productController.getCategoryBySlug);
router.get("/:slug", productController.getProductBySlug);

export default router;
