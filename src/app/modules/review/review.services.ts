import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.utils";

const giveReview=async(user:IRequestUser,payload:ICreateReviewPayload)=>{
    const patientData=await prisma.patient.findFirstOrThrow({
        where:{
            id:user.userId
        }
    })

    const appointmentData=await prisma.appointment.findFirstOrThrow({
        where:{
            id:payload.appointmentId
        }
    })

    if(appointmentData.paymentStatus!==PaymentStatus.PAID){
        throw new AppError(status.BAD_REQUEST,"You can review after payment is done")
    }

    if(appointmentData.patientId!==patientData.id){
        throw new AppError(status.FORBIDDEN,"You can review only your appointment")
    }

    const isReview=await prisma.review.findFirst({
        where:{
            appointmentId:payload.appointmentId
        }
    })

    if(isReview){
        throw new AppError(status.BAD_REQUEST,"You have already reviewed for this appointment")
    }

    const result=await prisma.$transaction(async(tx)=>{
        const review=await tx.review.create({
            data:{
                ...payload,
                doctorId:appointmentData.doctorId,
                patientId:appointmentData.patientId
            }
        })

        const avgRating=await tx.review.aggregate({
            where:{
                doctorId:appointmentData.doctorId
            },
            _avg:{
                rating:true
            }
        })

        await tx.doctor.update({
            where:{
                id:appointmentData.doctorId
            },
            data:{
                averageRating:avgRating._avg.rating as number
            }
        })

        return review
    })

    return result;
}



export const reviewServices={
    giveReview
}