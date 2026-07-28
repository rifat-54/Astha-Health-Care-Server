import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../utils/jwt";
import { envVeriable } from "../config/env";

export const checkAuth=(...authRoles:UserRole[])=>{
   return async(req:Request,res:Response,next:NextFunction)=>{
       try {
        //! session token verifation
        const sessionToken=cookieUtils.getCookie(req,"better-auth.session_token")
        // console.log("session Token",sessionToken)
        if(!sessionToken){
            throw new AppError(status.UNAUTHORIZED,"Unauthorized access! no session token privied")
        }

        if(sessionToken){
            const sessionExits=await prisma.session.findFirst({
                where:{
                    token:sessionToken,
                    expiresAt:{
                        gt:new Date()
                    }
                },
                include:{
                    user:true
                }
            })

            if(sessionExits && sessionExits.user){
                const user=sessionExits.user;

                const now=new Date()

                const expiresAt=new Date(sessionExits.expiresAt)
                const createdAt=new Date(sessionExits.createdAt)

                const sessionLifeTime=expiresAt.getTime()-createdAt.getTime()
                const timeRemaining=expiresAt.getTime()-now.getTime()
                const parcentRemaining=(timeRemaining/sessionLifeTime)*100

                if(parcentRemaining<20){
                    res.setHeader("X-Session-Refresh",'true')
                    res.setHeader('X-Session-Expires-At',expiresAt.toISOString())
                    res.setHeader('X-Time-Remaining',timeRemaining.toString())

                    console.log("Session Expireing Soon!")

                }

                if(user.status===UserStatus.BLOCKED || user.status===UserStatus.DELETED){
                    throw new AppError(status.UNAUTHORIZED,"Unauthorized access!,User is not active")
                }

                if(user.isDeleted){
                     throw new AppError(status.UNAUTHORIZED,"Unauthorized access!,User is deleted")
                }

                if(authRoles.length>0 && !authRoles.includes(user.role as UserRole)){
                    throw new AppError(status.FORBIDDEN,"Forbidden access!,You don't have permission to access this resouces")
                }


                // add addition fild on req

                req.user={
                    userId:user.id,
                    role:user.role,
                    email:user.email
                }
            }

        }


        // ! Access token
        const accessToken=cookieUtils.getCookie(req,"accessToken")

        if(!accessToken){
            throw new AppError(status.UNAUTHORIZED,"Unauthorized accesss! no access token privided")
        }

        const verifiedToken=jwtUtils.verifToken(accessToken,envVeriable.ACCESS_TOKEN_SECRET)

        if(!verifiedToken.success){
            throw new AppError(status.UNAUTHORIZED,"Unauthorized access! Invalid access token")
        }

        if(authRoles.length>0 && !authRoles.includes(verifiedToken?.data?.role)){
            throw new AppError(status.FORBIDDEN,"Forbidden access! You don't have permission to access this resouces")
        }
        

        next()

       } catch (error) {
            next(error)
       }
   }

}