// import { uuidv7 } from "zod";
import {v7 as uuidv7} from"uuid"
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";


const bookApppointment=async(payload:IBookAppointmentPayload,user:IRequestUser)=>{

    const patientData=await prisma.patient.findFirstOrThrow({
        where:{
            email:user.email
        }
    })

    const doctorData=await prisma.doctor.findFirstOrThrow({
        where:{
            id:payload.doctorId,
            isDeleted:false
        }
    })

    const scheduleData=await prisma.schedule.findUniqueOrThrow({
        where:{
            id:payload.scheduleId
        }
    })

    const doctorSchedule=await prisma.doctorSchedules.findUniqueOrThrow({
        where:{
            doctorId_scheduleId:{
                doctorId:doctorData.id,
                scheduleId:scheduleData.id
            }
        }
    })

    const videoCallingId=String(uuidv7())

    console.log(videoCallingId)

    const result=await prisma.$transaction(async(tx)=>{
        const appointmentData=await tx.appointment.create({
            data:{
                doctorId:doctorData.id,
                patientId:patientData.id,
                scheduleId:doctorSchedule.scheduleId,
                videoCallingId
            }
        })

        await tx.doctorSchedules.update({  
            where:{
                doctorId_scheduleId:{
                    doctorId:doctorData.id,
                    scheduleId:doctorSchedule.scheduleId
                }
            },
            data:{
                isBooked:true
            }
        })

        return appointmentData
    })

    return result

}




export const appointmentServices={
    bookApppointment
}