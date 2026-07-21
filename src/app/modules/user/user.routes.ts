import { NextFunction, Request, Response, Router } from "express";
import { userControler } from "./user.controller";
import z from "zod";
import { Gender } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post("/create-doctor",
  validateRequest(createDoctorZodSchema),
  userControler.createDoctor,
);

export const userRoutes = router;
