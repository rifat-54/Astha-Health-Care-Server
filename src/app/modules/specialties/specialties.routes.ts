import { Router } from "express";
import { specialtyController } from "./specialties.controller";

const router=Router()

router.post("/",specialtyController.createSpecialty)

export const SpecialtyRoutes=router