import { Router } from "express";
import * as adminUserController from "../../controllers/admin/admin.user.controller.js";

const router = Router();

router.get("/", adminUserController.getUsers);
router.patch("/:id/role", adminUserController.updateUserRole);

export default router;
