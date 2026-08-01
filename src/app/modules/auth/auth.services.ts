import status from "http-status"
import { UserStatus } from "../../../generated/prisma/enums"
import AppError from "../../errorHelpers/AppError"
import { IRequestUser } from "../../interface/requestUser.interface"
import { auth } from "../../lib/auth"
import { prisma } from "../../lib/prisma"
import { tokenUtils } from "../../utils/token"
import { jwtUtils } from "../../utils/jwt"
import { envVeriable } from "../../config/env"
import { JwtPayload } from "jsonwebtoken"
import { IChangePasswordPayload } from "./auth.interface"

interface IRegistrationPatientPayload{
    name:string,
    email:string,
    password:string
}


const registerPatient=async(payload:IRegistrationPatientPayload)=>{
    const{name,email,password}=payload

    const data=await auth.api.signUpEmail({
        body:{
            name,
            email,
            password
        }
    })

    if(!data.user){
        throw new Error("Failed to register Patient")
    }

    try {
            const patient=await prisma.$transaction(async(tx)=>{
        const patientTx=await tx.patient.create({
            data:{
                userId:data.user.id,
                name:payload.name,
                email:payload.email
            }
        })
        return patientTx;
    })


    // token

        const accessToken=tokenUtils.getAccessToken({
        userId:data.user.id,
        role:data.user.role,
        name:data.user.name,
        email:data.user.email,
        status:data.user.status,
        isDeleted:data.user.isDeleted,
        emailVerified:data.user.emailVerified
    })
    const refreshToken=tokenUtils.getRefreshToken({
        userId:data.user.id,
        role:data.user.role,
        name:data.user.name,
        email:data.user.email,
        status:data.user.status,
        isDeleted:data.user.isDeleted,
        emailVerified:data.user.emailVerified
    })


    return {
        ...data,
    accessToken,
    refreshToken,
    patient
    };

    // return {...data,patient};


    } catch (error) {
        console.log("Transaction error",error)
        await prisma.user.delete({
            where:{
                id:data.user.id
            }
        })
        throw error
    }


}

const loginPatient=async(payload:IRegistrationPatientPayload)=>{
    const{name,email,password}=payload

    const data=await auth.api.signInEmail({
        body:{
            email,
            password
        }
    })

    if(!data.user){
        throw new Error("Failed to login Patient")
    }

    if(data.user.status===UserStatus.BLOCKED){
        throw new Error("User is blocked")
    }

    if(data.user.isDeleted  || data.user.status===UserStatus.DELETED){
        throw new Error("User is deleted")
    }

    const accessToken=tokenUtils.getAccessToken({
        userId:data.user.id,
        role:data.user.role,
        name:data.user.name,
        email:data.user.email,
        status:data.user.status,
        isDeleted:data.user.isDeleted,
        emailVerified:data.user.emailVerified
    })
    const refreshToken=tokenUtils.getRefreshToken({
        userId:data.user.id,
        role:data.user.role,
        name:data.user.name,
        email:data.user.email,
        status:data.user.status,
        isDeleted:data.user.isDeleted,
        emailVerified:data.user.emailVerified
    })


    return {
        ...data,
    accessToken,
    refreshToken
    };
}

const getMe=async(user:IRequestUser)=>{

    const isUserExists=await prisma.user.findUnique({
        where:{
            id:user.userId
        },
        include:{
            patient:{
                include:{
                    review:true,
                    prescription:true,
                    medicalReports:true,
                    patientHealthData:true,
                    appointment:true
                }
            },
            doctor:{
                include:{
                    doctorSpecilaties:true,
                    appointments:true,
                    review:true,
                    prescription:true
                }
            },
            admin:true
        },

    })

    if(!isUserExists){
        throw new AppError(status.NOT_FOUND,"User not found")
    }

    return isUserExists
}

const getNewtoken=async(refreshToken:string,sessionToken:string)=>{

    const isSessionExists=await prisma.session.findUnique({
        where:{
            token:sessionToken
        },
        include:{
            user:true
        }
    })

    if(!isSessionExists){
        throw new AppError(status.UNAUTHORIZED,"Invalid session token")
    }

    const verifiedRefreshToken=jwtUtils.verifToken(refreshToken,envVeriable.REFRESH_TOKEN_SECRET)

    if(!verifiedRefreshToken.success || verifiedRefreshToken.error){
        throw new AppError(status.UNAUTHORIZED,"Invalid refresh token")
    }

    const data=verifiedRefreshToken.data as JwtPayload

    const newAccessToken=tokenUtils.getAccessToken({
        userId:data.userId,
        role:data.role,
        name:data.name,
        email:data.email,
        status:data.status,
        isDeleted:data.isdeleted,
        emailVerified:data.emailVerified
    })

    const newRefreshToken=tokenUtils.getRefreshToken({
        userId:data.userId,
        role:data.role,
        name:data.name,
        email:data.email,
        status:data.status,
        isDeleted:data.isdeleted,
        emailVerified:data.emailVerified
    })

    const {token}=await prisma.session.update({
        where:{
            token:sessionToken
        },
        data:{
            token:sessionToken,
            expiresAt:new Date(Date.now()+60 * 60  * 24 ),
            updatedAt:new Date()
        }
    })

    return{
        accessToken:newAccessToken,
        refreshToken:newRefreshToken,
        sessionToken:token
    }

}


const changePassword=async(payload:IChangePasswordPayload,sessionToken:string)=>{
    console.log(payload)

    const session=await auth.api.getSession({
        headers:new Headers({
            Authorization:`Bearer ${sessionToken}`
        })
    })

    console.log("session",session)


    if(!session){
        throw new AppError(status.UNAUTHORIZED,"Invalid session token")
    }

    const {currentPassword,newPassword}=payload

    const result=await auth.api.changePassword({
        body:{
            currentPassword,
            newPassword,
            revokeOtherSessions:true
        },
        headers:new Headers({
            Authorization:`Bearer ${sessionToken}`
        })
    })


    if(session.user.needPasswordChange){
        await prisma.user.update({
            where:{
                id:session.user.id
            },
            data:{
                needPasswordChange:false
            }
        })
    }


    // create again new token to set on brawser
    const data=result.user

    const accessToken=tokenUtils.getAccessToken({
        userId:data.userId,
        role:data.role,
        name:data.name,
        email:data.email,
        status:data.status,
        isDeleted:data.isdeleted,
        emailVerified:data.emailVerified
    })

    const refreshToken=tokenUtils.getRefreshToken({
        userId:data.userId,
        role:data.role,
        name:data.name,
        email:data.email,
        status:data.status,
        isDeleted:data.isdeleted,
        emailVerified:data.emailVerified
    })


    return {
        ...result,
        accessToken,
        refreshToken
    }
}

const logOut=async(sessionToken:string)=>{

    const result=await auth.api.signOut({
        headers:new Headers({
            Authorization:`Bearer ${sessionToken}`
        })
    })
    return result
}

const verifyEmail=async(email:string,otp:string)=>{
    const result=await auth.api.verifyEmailOTP({
        body:{
            email,
            otp
        }
    })

    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where:{
                email
            },
            data:{
                emailVerified:true
            }
        })
    }

    return result;

}


const forgetPassword=async(email:string)=>{
    const isUserExist=await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(!isUserExist){
        throw new AppError(status.NOT_FOUND,"User not found")
    }

    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST,"Email not verified")
    }

    if(isUserExist.isDeleted || isUserExist.status===UserStatus.DELETED){
        throw new AppError(status.BAD_REQUEST,"Forbidden Access")
    }

    if(isUserExist.status===UserStatus.BLOCKED){
        throw new AppError(status.BAD_REQUEST,"Forbidden Access")
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email
        }
    })
}


const resetPassword=async(email:string,otp:string,newPassword:string)=>{
    const isUserExist=await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(!isUserExist){
        throw new AppError(status.NOT_FOUND,"User not found")
    }

    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST,"Email not verified")
    }

    if(isUserExist.isDeleted || isUserExist.status===UserStatus.DELETED){
        throw new AppError(status.BAD_REQUEST,"Forbidden Access")
    }

    if(isUserExist.status===UserStatus.BLOCKED){
        throw new AppError(status.BAD_REQUEST,"Forbidden Access")
    }

    await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password:newPassword
        }
    })

    if(isUserExist.needPasswordChange){
        await prisma.user.update({
            where:{
                id:isUserExist.id
            },
            data:{
                needPasswordChange:false
            }
        })
    }

    await prisma.session.deleteMany({
        where:{
            userId:isUserExist.id
        }
    })
}


export const authServices={
    registerPatient,
    loginPatient,
    getMe,
    getNewtoken,
    changePassword,
    logOut,
    verifyEmail,
    forgetPassword,
    resetPassword
}