import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreatePrescriptionPayload, IUpdatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";
import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../config/cloudinary.config";
import { buffer } from "node:stream/consumers";
import { sendEmail } from "../../utils/email";
import { UserRole } from "../../../generated/prisma/enums";


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

const myPrescription=async(user:IRequestUser)=>{
    const exitUser=await prisma.user.findUniqueOrThrow({
        where:{
            email:user.email
        }
    })

    if(exitUser.role===UserRole.DOCTOR){
        const result=await prisma.prescription.findMany({
            where:{
                doctor:{
                    email:user.email
                }
            },
            include:{
                appointment:true,
                doctor:true,
                patient:true
            }
        })

        return result
    }

    if(user.role===UserRole.PATIENT){
        const result=await prisma.prescription.findMany({
            where:{
                patient:{
                    email:user.email
                }
            },
            include:{
                doctor:true,
                patient:true,
                appointment:true
            }
        })

        return result;
    }
}

const getAllPrescription=async()=>{
    const result=await prisma.prescription.findMany({
        include:{
            patient:true,
            doctor:true,
            appointment:true
        }
    })

    return result;
}


const updatePrescription=async(user:IRequestUser,prescriptionId:string,payload:IUpdatePrescriptionPayload)=>{

    // fetch current prescription data
    const prescriptionData=await prisma.prescription.findUniqueOrThrow({
        where:{
            id:prescriptionId
        },
        include:{
            doctor:true,
            patient:true,
            appointment:{
                include:{
                    schedule:true
                }
            }
        }
    })

    // verify the doctor give this prescription

    if(!(prescriptionData.doctor.email===user.email)){
        throw new AppError(status.FORBIDDEN,"This is not your prescripton")
    }

    // prepare updated data
    const updatedInstructions=payload.instructions || prescriptionData.instructions
    const updatedFollowUpDate=payload.followUpDate ? payload.followUpDate : prescriptionData.followUpDate

    // generate new pdf
    const pdfBuffer=await generatePrescriptionPDF({
        doctorName: prescriptionData.doctor.name,
        doctorEmail: prescriptionData.doctor.email,
        patientName: prescriptionData.patient.name,
        patientEmail: prescriptionData.patient.email,
        appointmentDate: prescriptionData.appointment.schedule.startDateTime,
        instructions: updatedInstructions,
        followUpDate: updatedFollowUpDate,
        prescriptionId: prescriptionData.id,
        createdAt: prescriptionData.createdAt,
    })

    // upload new pdf to cloudinary
    const filename=`prescription-updated-${Date.now()}.pdf`
    const uploadedFile=await uploadFileToCloudinary(pdfBuffer,filename)
    const newPdfUrl=uploadedFile.secure_url

    // delete old pdf from cloudinary
    if(prescriptionData.pdfUrl){
        try {
            await deleteFileFromCloudinary(prescriptionData.pdfUrl)
        } catch (error) {
            console.error("Failed to delete old PDF from cloudinary",error)
        }
    }

    // update prescription in database
    const result=await prisma.prescription.update({
        where:{
            id:prescriptionId
        },
        data:{
            instructions:updatedInstructions,
            followUpDate:updatedFollowUpDate,
            pdfUrl:newPdfUrl
        },
        include:{
            patient:true,
            doctor:true,
            appointment:{
                include:{
                    schedule:true
                }
            }
        }
    })


    // send patient to new prescription

    try {
        await sendEmail({
            to:result.patient.email,
            subject:`Your prescription have been updated by Dr.${result.doctor.name}`,
            templateName:"prescription",
            templateData:{
                patientName: result.patient.name,
                doctorName: result.doctor.name,
                specialization: "Healthcare Provider",
                prescriptionId: result.id,
                appointmentDate: new Date(result.appointment.schedule.startDateTime).toLocaleString(),
                issuedDate: new Date(result.createdAt).toLocaleDateString(),
                followUpDate: new Date(result.followUpDate).toLocaleDateString(),
                instructions: result.instructions,
                pdfUrl: newPdfUrl
            },
            attachments:[
                {
                    filename:`Prescription-${result.id}.pdf`,
                    content:pdfBuffer,
                    contentType:"application/pdf"
                }
            ]
        })
    } catch (error) {
        console.error("Failed to send updated prescription email:",error)
    }

    return result;

}


const deletePrescription=async(user:IRequestUser,prescriptionId:string)=>{
    const prescriptionData=await prisma.prescription.findUniqueOrThrow({
        where:{
            id:prescriptionId
        },
        include:{
            doctor:true
        }
    })

    if(!(user.email===prescriptionData.doctor.email)){
         throw new AppError(status.BAD_REQUEST, "This is not your prescription!")
    }

    // delete old pdf from cloudinary
    if(prescriptionData.pdfUrl){
        try {
            await deleteFileFromCloudinary(prescriptionData.pdfUrl)
        } catch (error) {
            console.error("Failed to delete old PDF from cloudinary",error)
        }
    }

    // delete prescription form database
    const result=await prisma.prescription.delete({
        where:{
            id:prescriptionId
        }
    })

    return result
}



export const prescriptiionServices={
    givePrescription,
    myPrescription,
    getAllPrescription,
    updatePrescription,
    deletePrescription
}