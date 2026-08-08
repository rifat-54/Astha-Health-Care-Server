import { Router } from "express";
import { sheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { sheduleValidation } from "./schedule.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),validateRequest(sheduleValidation.createScheduleZodSchema),sheduleController.createSchedule)
router.get("/",sheduleController.getAllShedule)



export const sheduleRoute=router;