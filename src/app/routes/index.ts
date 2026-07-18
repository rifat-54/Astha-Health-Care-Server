import { Router } from "express";
import { SpecialtyRoutes } from "../modules/specialties/specialties.routes";

const router=Router()

router.use("/specialties",SpecialtyRoutes)

export const IndexRoutes=router;