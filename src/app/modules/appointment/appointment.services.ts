// import { uuidv7 } from "zod";
import {v7 as uuidv7} from"uuid"
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus, UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";


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
            },
        }
    })

    if(doctorSchedule.isBooked){
        throw new AppError(status.BAD_REQUEST,"This schedule is already booked.book another schedule")
    }

    console.log(doctorSchedule)

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

const getMyAppointment=async(user:IRequestUser)=>{

    console.log(user)



    if(user.role===UserRole.PATIENT){
        const patientData=await prisma.patient.findUniqueOrThrow({
            where:{
                email:user.email
            }
        })

        const result=await prisma.appointment.findMany({
            where:{
                patientId:patientData.id
            },
            include:{
                patient:true,
                schedule:true
            }
        })
        return result
    }else if(user.role===UserRole.DOCTOR){

        const doctorData=await prisma.doctor.findUniqueOrThrow({
            where:{
                email:user.email
            }
        })

         const result=await prisma.appointment.findMany({
            where:{
                doctorId:doctorData.id
            },
            include:{
                doctor:true,
                schedule:true
            }
        })
        return result
    }
  
}


const getAppointmentById=async(appointmentId:string,user:IRequestUser)=>{

    if(user.role===UserRole.PATIENT){
        const patientData=await prisma.patient.findUniqueOrThrow({
            where:{
                email:user.email
            }
        })

        const result=await prisma.appointment.findFirst({
            where:{
                patientId:patientData.id
            },
            include:{
                patient:true,
                schedule:true
            }
        })
        return result
    }else if(user.role===UserRole.DOCTOR){

        const doctorData=await prisma.doctor.findUniqueOrThrow({
            where:{
                email:user.email
            }
        })

         const result=await prisma.appointment.findFirst({
            where:{
                doctorId:doctorData.id
            },
            include:{
                doctor:true,
                schedule:true
            }
        })
        return result
    }


  
}

const changeAppointmentStatus=async(appointmentId:string,appointmentStatus:AppointmentStatus,user:IRequestUser)=>{
    const appointmentData=await prisma.appointment.findFirstOrThrow({
        where:{
            id:appointmentId
        },
        include:{
            doctor:true
        }
    })

    console.log(appointmentData,appointmentStatus)

    if(user.role===UserRole.DOCTOR && user.email!==appointmentData.doctor.email){
        throw new AppError(status.FORBIDDEN,"This is not your appointment")
    }

    const result=await prisma.appointment.update({
        where:{
            id:appointmentId
        },
        data:{
            status:appointmentStatus
        }
    })

    return result;

}

const getAllAppointment=async()=>{
    const result=await prisma.appointment.findMany({
        include:{
            doctor:true,
            patient:true,
            schedule:true
        }
    })

    return result
}


export const appointmentServices={
    bookApppointment,
    getMyAppointment,
    changeAppointmentStatus,
    getAppointmentById,
    getAllAppointment
}