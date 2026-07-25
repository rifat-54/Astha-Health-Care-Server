import { Router } from "express";
import { userControler } from "./user.controller";

import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post("/create-doctor",
  validateRequest(createDoctorZodSchema),
  userControler.createDoctor,
);

router.post("/create-admin",validateRequest(createAdminZodSchema),userControler.createAdmin)

router.post("/create-super-admin",validateRequest(createAdminZodSchema),userControler.createSuperAdmin)


export const userRoutes = router;
