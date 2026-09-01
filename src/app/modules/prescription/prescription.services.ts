import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { buffer } from "node:stream/consumers";
import { sendEmail } from "../../utils/email";


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

    console.log("appoint data ->",appointmentData)

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

        const pdfBuffer=await generatePrescriptionPDF({
            doctorName:doctorData.name,
            doctorEmail:doctorData.email,
            patientName:appointmentData.patient.name,
            patientEmail:appointmentData.patient.email,
            appointmentDate:appointmentData.schedule.startDateTime,
            instructions:payload.instructions,
            followUpDate,
            prescriptionId:result?.id,
            createdAt:new Date()
        })

        console.log("buffer=>",pdfBuffer)

        const fileName=`presctiption-${Date.now()}.pdf`
        const uploadFile=await uploadFileToCloudinary(pdfBuffer,fileName)
        console.log(uploadFile)
        const pdfUrl=uploadFile.secure_url

        console.log(pdfUrl)

        const updatePrescription=await tx.prescription.update({
            where:{
                id:result.id
            },
            data:{
                pdfUrl
            }
        })

        try {
            const patient=appointmentData.patient
            const doctor=appointmentData.doctor

            await sendEmail({
                to:patient.email,
                subject:`Your have received a new prescription from Dr. ${doctor.name}`,
                templateName:"prescription",
                templateData:{
                    doctorName: doctor.name,
                    patientName: patient.name,
                    specialization: doctor.doctorSpecilaties.map((s : any )=> s.title).join(", "),
                    appointmentDate: new Date(appointmentData.schedule.startDateTime).toLocaleString(),
                    issuedDate: new Date().toLocaleDateString(),
                    prescriptionId: result.id,
                    instructions: payload.instructions,
                    followUpDate: followUpDate.toLocaleDateString(),
                    pdfUrl: pdfUrl
                },
                attachments:[
                    {
                        filename:fileName,
                        content:pdfBuffer,
                        contentType:"application/pdf"
                    }
                ]
            })
        } catch (error) {
            console.log("Failed to send email notification for prescription",error)
        }

        return updatePrescription

    },{
        maxWait:15000,
        timeout:20000
    })

    return resullt;
}

export const prescriptiionServices={
    givePrescription
}