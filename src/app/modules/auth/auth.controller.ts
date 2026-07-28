import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import status from "http-status";


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


const getMe=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const result=await authServices.getMe(user)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"User Fetch Successfully",
            data:result
        })
    }
)

export const authController={
    registerPatient,
    loginPatient,
    getMe
}