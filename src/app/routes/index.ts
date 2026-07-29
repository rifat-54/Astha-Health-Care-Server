import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialties/specialties.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { doctorRoutes } from "../modules/doctor/doctor.routes";
import { adminRoutes } from "../modules/admin/admin.route";

const router=Router()

router.use("/specialties",SpecialtyRoutes)
router.use("/user",userRoutes)
router.use("/doctor",doctorRoutes)

router.use("/auth",authRoutes)

router.use("/admin",adminRoutes)

export const IndexRoutes=router;