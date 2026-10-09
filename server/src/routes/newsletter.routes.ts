import { Router } from "express";
import { subscribeToNewsletter } from "../controllers/newsletter.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { newsletterSchema } from "../validators/newsletter.validators.js";

const router = Router();

router.post("/subscribe", validate(newsletterSchema), subscribeToNewsletter);

export default router;
