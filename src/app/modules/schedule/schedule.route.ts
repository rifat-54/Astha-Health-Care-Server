import { Router } from "express";
import { sheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { sheduleValidation } from "./schedule.validation";

const router=Router()

router.post("/",validateRequest(sheduleValidation.createScheduleZodSchema),sheduleController.createSchedule)


export const sheduleRoute=router;