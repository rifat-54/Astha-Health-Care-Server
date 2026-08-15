import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { patientValidate } from "./patient.validation";
import { patientController } from "./patient.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.patch(
  "/update-patient-profile",
  checkAuth(UserRole.PATIENT),
  multerUpload.fields([
    {name:"profilePhoto",maxCount:1},
    {name:"medicalReport",maxCount:5}
  ])
  ,
  validateRequest(patientValidate.updatePatientProfileZodSchema),
  patientController.updatePatientProfile,
);



export const patientRoutes=router