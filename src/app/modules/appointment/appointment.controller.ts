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

export const appointmentController={
    bookApppointment
}