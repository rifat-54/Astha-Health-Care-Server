import { Router } from "express";
import { userControler } from "./user.controller";

import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post("/create-doctor",
  validateRequest(createDoctorZodSchema),
  userControler.createDoctor,
);

export const userRoutes = router;
