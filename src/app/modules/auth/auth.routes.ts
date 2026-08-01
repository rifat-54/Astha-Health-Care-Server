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

router.post("/change-password",checkAuth(UserRole.PATIENT,UserRole.DOCTOR,UserRole.ADMIN,UserRole.SUPER_ADMIN),authController.changePassword)

router.post("/logout",checkAuth(UserRole.PATIENT,UserRole.DOCTOR,UserRole.ADMIN,UserRole.SUPER_ADMIN),authController.logOut)

router.post("/verify-email",authController.verifyEmail)



export const authRoutes=router;  