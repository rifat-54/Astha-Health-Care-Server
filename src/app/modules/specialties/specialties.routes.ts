import { Router } from "express";
import { specialtyController } from "./specialties.controller";

const router=Router()

router.get("/",specialtyController.getAllSpecialty)
router.post("/",specialtyController.createSpecialty)
router.delete("/:id",specialtyController.deleteSpecialty)

export const SpecialtyRoutes=router