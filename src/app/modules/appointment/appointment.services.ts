
import {v7 as uuidv7} from"uuid"
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus, PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { envVeriable } from "../../config/env";

// pay now book appointment
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

        // payment inpliment

        const transactionId=String(uuidv7())
        console.log("tanjection id=>",transactionId)

        const paymentData=await tx.payment.create({
            data:{
                appointmentId:appointmentData.id,
                amount:doctorData.appointmentFee,
                transactionId
            }
        })

        // create stripe sesion
        const session=await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            mode:"payment",
            line_items:[
                {
                    price_data:{
                        currency:"bdt",
                        product_data:{
                            name:`Appointment with Dr. ${doctorData.name}`
                        },
                        unit_amount:doctorData.appointmentFee*100
                    },
                    quantity:1
                }
            ],
            metadata:{
                appointmentId:appointmentData.id,
                paymentId:paymentData.id
            },
            success_url:`${envVeriable.FRONTEND_URL}/dashboard/payment/payment-success`,
            cancel_url:`${envVeriable.FRONTEND_URL}/dashboard/appointments`
        })

        return {
            appointmentData,
            paymentData,
            paymentUrl:session.url
        }
    })

    return {
        appointment:result.appointmentData,
        payment:result.paymentData,
        paymentUrl:result.paymentUrl
    }

}

// pay now book appointment
const bookApppointmentWithPayLater=async(payload:IBookAppointmentPayload,user:IRequestUser)=>{

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

        // payment inpliment

        const transactionId=String(uuidv7())

        const paymentData=await tx.payment.create({
            data:{
                appointmentId:appointmentData.id,
                amount:doctorData.appointmentFee,
                transactionId
            }
        })


        return {
            appointmentData,
            paymentData,
        }
    })

    return {
        appointment:result.appointmentData,
        payment:result.paymentData
    }

}


const initiatePayment=async(appointmentId:string,user:IRequestUser)=>{

    const patientData=await prisma.patient.findFirstOrThrow({
        where:{
            email:user.email
        }
    })

    const appointmentData=await prisma.appointment.findUniqueOrThrow({
        where:{
            id:appointmentId,
            patientId:patientData.id
        },
        include:{
            doctor:true,
            payment:true
        }
    })

    if(!appointmentData){
        throw new AppError(status.NOT_FOUND,"Appointment not found")
    }

    if(!appointmentData.payment){
        throw new AppError(status.NOT_FOUND,"Payment data not found for this appointment")
    }

    if(appointmentData.payment?.status===PaymentStatus.PAID){
         throw new AppError(status.BAD_REQUEST, "Payment already completed for this appointment");
    }

    if(appointmentData.status===AppointmentStatus.CANCELED){
        throw new AppError(status.BAD_REQUEST,"Appointment is cancelled")
    }

    const session=await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        mode:"payment",
        line_items:[
            {
                price_data:{
                    currency:"bdt",
                    product_data:{
                        name:`Appointment with Dr. ${appointmentData.doctor.name}`
                    },
                    unit_amount:appointmentData.doctor.appointmentFee *100
                },
                quantity:1
            }
        ],
        metadata:{
            appointmentId:appointmentData.id,
            paymentId:appointmentData.payment.id
        },

        success_url:`${envVeriable.FRONTEND_URL}/dashboard/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}`,

        cancel_url:`${envVeriable.FRONTEND_URL}/dashboard/appointment?error=payment_cancelled`
    })

    return{
        paymentUrl:session.url
    }


    
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


const cancelUnpaidAppointments=async()=>{

    const thirtyMinutesAgo=new Date(Date.now()-30*60*1000)
    
    const unpaidAppointments=await prisma.appointment.findMany({
        where:{
            createdAt:{
                lte:thirtyMinutesAgo
            },
            paymentStatus:PaymentStatus.UNPAID
        }
    })

    const appointmentToCancel=unpaidAppointments.map(appointment=>appointment.id)

    await prisma.$transaction(async(tx)=>{

        await tx.appointment.updateMany({
            where:{
                id:{
                    in:appointmentToCancel
                }
            },
            data:{
                status:AppointmentStatus.CANCELED
            }
        })

        await tx.payment.deleteMany({
            where:{
                appointmentId:{
                    in:appointmentToCancel
                }
            }
        })

        for(const unpaidAppointment of unpaidAppointments){
            await tx.doctorSchedules.update({
                where:{
                    doctorId_scheduleId:{
                        doctorId:unpaidAppointment.doctorId,
                        scheduleId:unpaidAppointment.scheduleId
                    }
                },
                data:{
                    isBooked:false
                }
            })
        }
    })
}


export const appointmentServices={
    bookApppointment,
    getMyAppointment,
    changeAppointmentStatus,
    getAppointmentById,
    getAllAppointment,
    bookApppointmentWithPayLater,
    initiatePayment,
    cancelUnpaidAppointments
}