import { UserStatus } from "../../../generated/prisma/enums"
import { auth } from "../../lib/auth"
import { prisma } from "../../lib/prisma"

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

    return data;
}

export const authServices={
    registerPatient,
    loginPatient
}