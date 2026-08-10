import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/",checkAuth(UserRole.DOCTOR),doctorScheduleController.createDoctorSchedule)
router.get("/my-schedule",checkAuth(UserRole.DOCTOR),doctorScheduleController.getMyDoctorSchedule)
router.get("/",doctorScheduleController.getAllDoctorSchedule)
router.get("/:doctorId/schedule/:scheduleId",doctorScheduleController.getDoctorScheduleById)
router.patch("/update-my-schedule",checkAuth(UserRole.DOCTOR),doctorScheduleController.updateMyDoctorSchedule)

router.delete("/my-schedule/:id",checkAuth(UserRole.DOCTOR),doctorScheduleController.deleteDoctorSchedule)

export const doctorScheduleRoute=router;