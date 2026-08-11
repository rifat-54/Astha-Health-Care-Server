import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/",checkAuth(UserRole.PATIENT),appointmentController.bookApppointment)

export const appointmentRoute=router