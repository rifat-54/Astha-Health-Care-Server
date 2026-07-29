import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";


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

const getNewtoken=catchAsync(
    async(req:Request,res:Response)=>{
        const refreshToken=req.cookies.refreshToken;
        const betterAuthSessionToken=req.cookies["better-auth.session_token"]

        if(refreshToken){
            throw new AppError(status.UNAUTHORIZED,"Refresh token is missing")
        }


        const result=await authServices.getNewtoken(refreshToken,betterAuthSessionToken)

        const {accessToken,refreshToken:newRefreshToken,sessionToken}=result;

        tokenUtils.setAccessTokenCookie(res,accessToken)
        tokenUtils.setRefreshTokenCookie(res,newRefreshToken)
        tokenUtils.setBetterAuthSessionCookie(res,sessionToken)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"New token generated Successfully",
            data:result
        })
    }
)

export const authController={
    registerPatient,
    loginPatient,
    getMe,
    getNewtoken
}