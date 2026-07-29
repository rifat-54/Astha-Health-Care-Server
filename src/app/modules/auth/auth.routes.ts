import { Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { cookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/register",authController.registerPatient)
router.post("/login",authController.loginPatient)

router.get("/me",checkAuth(),authController.getMe)
router.post("/refresh-token",authController.getNewtoken)

export const authRoutes=router;  