import { Router } from "express";
import * as adminCategoryController from "../../controllers/admin/admin.category.controller.js";

const router = Router();

router.post("/", adminCategoryController.createCategory);
router.get("/", adminCategoryController.getCategories);
router.get("/:id", adminCategoryController.getCategoryById);
router.patch("/:id", adminCategoryController.updateCategory);
router.delete("/:id", adminCategoryController.deleteCategory);

export default router;
