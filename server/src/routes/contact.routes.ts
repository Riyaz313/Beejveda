import { Router } from "express";
import { submitContactMessage } from "../controllers/contact.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { contactSchema } from "../validators/contact.validators.js";

const router = Router();

router.post("/", validate(contactSchema), submitContactMessage);

export default router;
