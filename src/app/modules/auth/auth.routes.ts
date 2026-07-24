import { Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { cookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.post("/register",authController.registerPatient)
router.post("/login",authController.loginPatient)


router.post("/demo",checkAuth(UserRole.PATIENT),async(req:Request,res:Response)=>{
    tokenUtils.setAccessTokenCookie(res,"iampaglaghura")
    res.send("done work set cookie now check it")
})

// router.get("/demo2",async(req:Request,res:Response)=>{
//     // tokenUtils.setAccessTokenCookie(res,"iampaglaghura")
//     const cookie=cookieUtils.getCookie(req,"accessToken")
// res.send(`${cookie}`)
// })

export const authRoutes=router;