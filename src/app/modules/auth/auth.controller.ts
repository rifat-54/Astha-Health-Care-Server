import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookie";


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

        if(!refreshToken){
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

const changePassword=catchAsync(
    async(req:Request,res:Response)=>{

        const betterAuthSessionToken=req.cookies["better-auth.session_token"]

        // console.log(betterAuthSessionToken)
        const result=await authServices.changePassword(req.body,betterAuthSessionToken)

        const  {accessToken,refreshToken,token}=result

        tokenUtils.setAccessTokenCookie(res,accessToken)
        tokenUtils.setRefreshTokenCookie(res,refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res,token as string)



        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully change password",
            data:result
        })
    }
)

const logOut=catchAsync(
    async(req:Request,res:Response)=>{
        const sessionToken=req.cookies["better-auth.session_token"]

        const  result=await authServices.logOut(sessionToken)

        cookieUtils.clearCookie(res,"accessToken",{
            httpOnly:true,
            secure:true,
            sameSite:"none"
        })
        cookieUtils.clearCookie(res,"refreshToken",{
            httpOnly:true,
            secure:true,
            sameSite:"none"
        })
        cookieUtils.clearCookie(res,"better-auth.session_token",{
            httpOnly:true,
            secure:true,
            sameSite:"none"
        })

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully logout",
            data:result
        })
    }
)

const verifyEmail=catchAsync(
    async(req:Request,res:Response)=>{

        const {email,otp}=req.body

        const result=await authServices.verifyEmail(email,otp)


            sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully verified email",
            data:result
        })
    }
)



export const authController={
    registerPatient,
    loginPatient,
    getMe,
    getNewtoken,
    changePassword,
    logOut,
    verifyEmail
}