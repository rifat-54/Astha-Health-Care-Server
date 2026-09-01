import { Router } from "express";
import { prescriptionController } from "./prescription.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { PrescriptionValidation } from "./prescription.validation";


const router=Router()

router.post("/",checkAuth(UserRole.DOCTOR),validateRequest(PrescriptionValidation.createPrescriptionZodSchema),prescriptionController.givePrescription)
router.get("/",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),prescriptionController.getAllPrescription)
router.get("/myprescription",checkAuth(UserRole.DOCTOR),prescriptionController.myPrescription)
router.patch("/:id",checkAuth(UserRole.DOCTOR),validateRequest(PrescriptionValidation.updatePrescriptionZodSchema),prescriptionController.updatePrescription)

router.delete("/:id",checkAuth(UserRole.DOCTOR),prescriptionController.deletePrescription)
export const prescriptionRoute=router