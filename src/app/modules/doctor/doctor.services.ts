import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"


const getAllDoctors=async()=>{
    const doctor=await prisma.doctor.findMany({
        include:{
            user:true,
            doctorSpecilaties:{
                include:{
                    specialty:true
                }
            }
        }
    })

    return doctor;
}

const getDoctorById=async(id:string)=>{
    const doctor=await prisma.doctor.findUnique({
        where:{
            id
        },
        include:{
            user:true,
            doctorSpecilaties:true
        }
    })

    if(!doctor){
        throw new AppError(status.NOT_FOUND,"Doctor not found.Provide right id")
    }

    return doctor;
}

export const doctorServices={
    getAllDoctors,
    getDoctorById
}