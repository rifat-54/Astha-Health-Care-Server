import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { sendResponse } from "../../shared/sendResponse"
import status from "http-status"
import { doctorScheduleServices } from "./doctorSchedule.services"
import { IQueryParams } from "../../interface/query.interface"

const createDoctorSchedule=catchAsync(
    async(req:Request,res:Response)=>{

        const result=await doctorScheduleServices.createDoctorSchedule(req.user,req.body)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Successfully created schedule",
            data:result
        })
    }
)

const getMyDoctorSchedule=catchAsync(
    async(req:Request,res:Response)=>{

        const result=await doctorScheduleServices.getMyDoctorSchedule(req.user,req.query as IQueryParams)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Doctor schedules retrived successfully",
            data:result
        })
    }
)


const getAllDoctorSchedule=catchAsync(
    async(req:Request,res:Response)=>{

        const result=await doctorScheduleServices.getAllDoctorSchedule(req.query as IQueryParams)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully feched all doctor schedule",
            data:result
        })
    }
)

const getDoctorScheduleById=catchAsync(
    async(req:Request,res:Response)=>{

        const doctorId=req.params.doctorId as string
        const scheduleId=req.params.scheduleId as string

        const result=await doctorScheduleServices.getDoctorScheduleById(doctorId,scheduleId)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully feched all doctor schedule",
            data:result
        })
    }
)

const updateMyDoctorSchedule=catchAsync(
    async(req:Request,res:Response)=>{

       const user=req.user

        const result=await doctorScheduleServices.updateMyDoctorSchedule(user,req.body)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully updated doctor schedule",
            data:result
        })
    }
)

const deleteDoctorSchedule=catchAsync(
    async(req:Request,res:Response)=>{

       const user=req.user

        const result=await doctorScheduleServices.deleteDoctorSchedule(user,req.params.id as string)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully deleted doctor schedule",
            data:result
        })
    }
)


export const doctorScheduleController={
    createDoctorSchedule,
    getMyDoctorSchedule,
    getAllDoctorSchedule,
    getDoctorScheduleById,
    updateMyDoctorSchedule,
    deleteDoctorSchedule
}