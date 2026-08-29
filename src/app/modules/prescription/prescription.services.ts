import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";


const givePrescription=async(user:IRequestUser,payload:ICreatePrescriptionPayload)=>{
    const doctorData=await prisma.doctor.findUniqueOrThrow({
        where:{
            email:user.email
        }
    })

    const appointmentData=await prisma.appointment.findFirstOrThrow({
        where:{
            id:payload.appointmentId
        },
        include:{
            patient:true,
            doctor:{
                include:{
                    doctorSpecilaties:true
                }
            },
            schedule:{
                include:{
                    doctorSchedule:true
                }
            }
        }
    })

    if(appointmentData.doctorId!==doctorData.id){
        throw new AppError(status.BAD_REQUEST,"You can create prescriptiion only your own appointment")
    }

    const isAlreadyPrescribed=await prisma.prescription.findFirst({
        where:{
            appointmentId:payload.appointmentId
        }
    })

    if(isAlreadyPrescribed){
        throw new AppError(status.BAD_GATEWAY,"You already created prescribed")
    }

    const followUpDate=new Date(payload.followUpDate)

    const resullt=await prisma.$transaction(async(tx)=>{
        const result=await tx.prescription.create({
            data:{
                ...payload,
                followUpDate,
                doctorId:appointmentData.doctorId,
                patientId:appointmentData.patientId
            }
        })

        const pdfBuffer=await generatePrescriptionPDF({})
    })
}