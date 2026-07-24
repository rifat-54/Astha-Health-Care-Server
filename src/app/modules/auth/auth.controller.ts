import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";


const registerPatient=catchAsync(async(req:Request,res:Response)=>{
    const payload=req.body;

    const result=await authServices.registerPatient(payload)

        const{accessToken,refreshToken,token,...rest}=result

    tokenUtils.setAccessTokenCookie(res,accessToken)
    tokenUtils.setRefreshTokenCookie(res,refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res,token!);

    sendResponse(res,{
        httpStatusCode:201,
        success:true,
        message:"Patient register successfully",
        data:{
            token,
            accessToken,
            refreshToken,
            ...rest
        }
    })
})

const loginPatient=catchAsync(async(req:Request,res:Response)=>{
    const payload=req.body;

    const result=await authServices.loginPatient(payload)

    const{accessToken,refreshToken,token,...rest}=result

    tokenUtils.setAccessTokenCookie(res,accessToken)
    tokenUtils.setRefreshTokenCookie(res,refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res,token);

    sendResponse(res,{
        httpStatusCode:201,
        success:true,
        message:"Patient login successfully",
        data:{
            token,
            accessToken,
            refreshToken,
            ...rest
        }
    })
})


export const authController={
    registerPatient,
    loginPatient
}