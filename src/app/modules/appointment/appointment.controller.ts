import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { appointmentServices } from "./appointment.services"
import { sendResponse } from "../../shared/sendResponse"
import status from "http-status"


const bookApppointment=catchAsync(
    async(req:Request,res:Response)=>{
        const payload=req.body
        const user=req.user

        const result=await appointmentServices.bookApppointment(payload,user)

        sendResponse(res,{
            success:true,
            httpStatusCode:status.CREATED,
            message:"Appointment booked successfully",
            data:result
        })
    }
)

const getMyAppointment=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const result=await appointmentServices.getMyAppointment(user)

        sendResponse(res,{
            success:true,
            httpStatusCode:status.OK,
            message:"Appointment fetch successfully",
            data:result
        })
    }
)

const changeAppointmentStatus=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const appointmentId=req.params.id as string
        const appointmentStatus=req.body.status

        const result=await appointmentServices.changeAppointmentStatus(appointmentId,appointmentStatus,user)

        sendResponse(res,{
            success:true,
            httpStatusCode:status.OK,
            message:"AppointmentStatus updated successfully",
            data:result
        })
    }
)


const getAppointmentById=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const appointmentId=req.params.id as string
  

        const result=await appointmentServices.getAppointmentById(appointmentId,user)

        sendResponse(res,{
            success:true,
            httpStatusCode:status.OK,
            message:"Appointment fetch successfully",
            data:result
        })
    }
)

const getAllAppointment=catchAsync(
    async(req:Request,res:Response)=>{

        const result=await appointmentServices.getAllAppointment()

        sendResponse(res,{
            success:true,
            httpStatusCode:status.OK,
            message:"All Appointment fetch successfully",
            data:result
        })
    }
)


export const appointmentController={
    bookApppointment,
    getMyAppointment,
    changeAppointmentStatus,
    getAppointmentById,
    getAllAppointment
}