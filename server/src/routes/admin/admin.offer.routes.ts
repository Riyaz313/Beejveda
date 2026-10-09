import { Router } from "express";
import { sendOfferCampaignToUsers } from "../../controllers/admin/admin.offer.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { adminOfferSchema } from "../../validators/admin.offer.validators.js";

const router = Router();

router.post("/send", validate(adminOfferSchema), sendOfferCampaignToUsers);

export default router;
