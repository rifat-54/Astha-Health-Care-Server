import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";

const router=Router()

router.post("/",checkAuth(UserRole.PATIENT),reviewController.giveReview)



export const reviewRoutes=router