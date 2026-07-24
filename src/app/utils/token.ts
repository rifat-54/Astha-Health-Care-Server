import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVeriable } from "../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";
import ms, { StringValue } from "ms";

const getAccessToken=(payload:JwtPayload)=>{
    const accesstoken=jwtUtils.createToken(payload,envVeriable.ACCESS_TOKEN_SECRET,{expiresIn:envVeriable.ACCESS_TOKEN_EXPIRE_IN} as SignOptions)

    return accesstoken;
}

const getRefreshToken=(payload:JwtPayload)=>{
    const refreshtoken=jwtUtils.createToken(payload,envVeriable.REFRESH_TOKEN_SECRET,{expiresIn:envVeriable.REFRESH_TOKEN_EXPIRE_IN} as SignOptions)

    return refreshtoken
}

const setAccessTokenCookie=(res:Response,token:string)=>{
    //   const maxAge=ms(envVeriable.ACCESS_TOKEN_EXPIRE_IN as StringValue)
    cookieUtils.setCookie(res,"accessToken",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        path:"/",
        maxAge:60 * 60 * 24 * 1000 * 1
        // maxAge:Number(maxAge)
    })
}

const setRefreshTokenCookie=(res:Response,token:string)=>{
    //   const maxAge=ms(envVeriable.REFRESH_TOKEN_EXPIRE_IN as StringValue)
    cookieUtils.setCookie(res,"refreshToken",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        path:"/",
        maxAge:60 * 60 * 24 * 1000 * 1
        // maxAge:Number(maxAge)
    })
}

const setBetterAuthSessionCookie=(res:Response,token:string)=>{
    // const maxAge=ms(envVeriable.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)
    cookieUtils.setCookie(res,"better-auth.session_token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        path:"/",
        maxAge:60 * 60 * 24 * 1000 * 1
        // maxAge:Number(maxAge)
    })
}


export const tokenUtils={
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
}