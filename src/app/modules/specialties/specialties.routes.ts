import { Router } from "express";
import { specialtyController } from "./specialties.controller";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { specialtyValidation } from "./specialty.validation";

const router=Router()

router.get("/",specialtyController.getAllSpecialty)
router.post("/",multerUpload.single("file"),validateRequest(specialtyValidation.createSpecialtyZodSchema),specialtyController.createSpecialty)
router.delete("/:id",specialtyController.deleteSpecialty)

export const SpecialtyRoutes=router