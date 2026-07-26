import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { doctorValidation } from "./doctor.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";


const router=Router()


router.get("/",doctorController.getAllDoctors)

router.get("/:id",doctorController.getDoctorById)

router.delete("/:id",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),doctorController.softDeleteDoctor)

router.patch("/:id",checkAuth(UserRole.ADMIN,UserRole.DOCTOR,UserRole.SUPER_ADMIN),validateRequest(doctorValidation.doctorUpdateValidationZodSehema),doctorController.updateDoctor)

export const doctorRoutes=router;