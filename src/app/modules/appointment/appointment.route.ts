import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/",checkAuth(UserRole.PATIENT),appointmentController.bookApppointment)
router.get("/my-appointment",checkAuth(UserRole.PATIENT,UserRole.DOCTOR),appointmentController.getMyAppointment)
router.patch("/:id",checkAuth(UserRole.PATIENT,UserRole.DOCTOR,UserRole.ADMIN,UserRole.SUPER_ADMIN),appointmentController.changeAppointmentStatus)

export const appointmentRoute=router