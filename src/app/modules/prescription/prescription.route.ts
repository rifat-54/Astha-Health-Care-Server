import { Router } from "express";
import { prescriptionController } from "./prescription.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { PrescriptionValidation } from "./prescription.validation";


const router=Router()

router.post("/",checkAuth(UserRole.DOCTOR),validateRequest(PrescriptionValidation.createPrescriptionZodSchema),prescriptionController.givePrescription)
router.get("/myprescription",checkAuth(UserRole.DOCTOR),prescriptionController.myPrescription)

export const prescriptionRoute=router