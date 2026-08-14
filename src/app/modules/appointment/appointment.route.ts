import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/",checkAuth(UserRole.PATIENT),appointmentController.bookApppointment)
router.get("/my-appointment",checkAuth(UserRole.PATIENT,UserRole.DOCTOR),appointmentController.getMyAppointment)
router.get("/my-appointment/:id",checkAuth(UserRole.PATIENT,UserRole.DOCTOR),appointmentController.getAppointmentById)
router.patch("/:id",checkAuth(UserRole.PATIENT,UserRole.DOCTOR,UserRole.ADMIN,UserRole.SUPER_ADMIN),appointmentController.changeAppointmentStatus)
router.get("/all-appointment",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),appointmentController.getAllAppointment)

router.post("/book-appointment-with-pay-later",checkAuth(UserRole.PATIENT),appointmentController.bookApppointmentWithPayLater)
router.post("/initiate-payment/:id",checkAuth(UserRole.PATIENT),appointmentController.initiatePayment)

export const appointmentRoute=router