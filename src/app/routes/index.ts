import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialties/specialties.routes";
import { authRoutes } from "../modules/auth/auth.routes";

const router=Router()

router.use("/specialties",SpecialtyRoutes)

router.use("/auth",authRoutes)

export const IndexRoutes=router;