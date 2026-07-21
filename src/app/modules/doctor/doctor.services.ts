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

export const doctorServices={
    getAllDoctors
}