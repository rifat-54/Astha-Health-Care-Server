import { Router } from "express";
import { statsController } from "./stats.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.get("/",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN,UserRole.PATIENT,UserRole.DOCTOR),statsController.getDashboardStatsData)


export const statsRoutes=router