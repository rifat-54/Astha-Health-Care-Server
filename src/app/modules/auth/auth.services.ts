import { UserStatus } from "../../../generated/prisma/enums"
import { auth } from "../../lib/auth"
import { prisma } from "../../lib/prisma"
import { tokenUtils } from "../../utils/token"

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

    return {...data,patient};
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
        staus:data.user.status,
        isDeleted:data.user.isDeleted,
        emailVerified:data.user.emailVerified
    })
    const refreshToken=tokenUtils.getAccessToken({
        userId:data.user.id,
        role:data.user.role,
        name:data.user.name,
        email:data.user.email,
        staus:data.user.status,
        isDeleted:data.user.isDeleted,
        emailVerified:data.user.emailVerified
    })


    return {
        ...data,
    accessToken,
    refreshToken
    };
}

export const authServices={
    registerPatient,
    loginPatient
}