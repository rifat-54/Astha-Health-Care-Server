import { Router } from "express";
import { sheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { sheduleValidation } from "./schedule.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),validateRequest(sheduleValidation.createScheduleZodSchema),sheduleController.createSchedule)
router.get("/",sheduleController.getAllShedule)
router.get("/:id",sheduleController.getScheduleById)
router.patch("/:id",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),validateRequest(sheduleValidation.updateScheduleZodSchema),sheduleController.updateSchedule)
router.delete("/:id",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),sheduleController.deleteSchedule)



export const sheduleRoute=router;