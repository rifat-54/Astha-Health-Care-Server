import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";

const router=Router()

router.post("/",checkAuth(UserRole.PATIENT),reviewController.giveReview)
router.get("/",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),reviewController.getAllReview)
router.get("/my-review",checkAuth(UserRole.PATIENT,UserRole.DOCTOR),reviewController.myReview)
router.patch("/:id",checkAuth(UserRole.PATIENT),reviewController.updateReview)
router.delete("/:id",checkAuth(UserRole.PATIENT),reviewController.deleteReview)



export const reviewRoutes=router