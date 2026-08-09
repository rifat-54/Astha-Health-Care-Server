import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sheduleServices } from "./schedule.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interface/query.interface";

const createSchedule=catchAsync(
    async(req:Request,res:Response)=>{

        const result=await sheduleServices.createSchedule(req.body)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Successfully Shedule Created",
            data:result
        })
    }
)

const getAllShedule=catchAsync(
    async(req:Request,res:Response)=>{

        const query=req.query

        const result=await sheduleServices.getAllShedule(query as IQueryParams)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully fetch Shedule",
            data:result
        })
    }
)

const getScheduleById=catchAsync(
    async(req:Request,res:Response)=>{

        const id=req.params.id as string

        const result=await sheduleServices.getScheduleById(id)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully fetch Shedule",
            data:result
        })
    }
)


const deleteSchedule=catchAsync(
    async(req:Request,res:Response)=>{

        const id=req.params.id as string

        const result=await sheduleServices.deleteSchedule(id)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully deleted Shedule",
            data:result
        })
    }
)


const updateSchedule=catchAsync(
    async(req:Request,res:Response)=>{

        const id=req.params.id as string

        const result=await sheduleServices.updateSchedule(id,req.body)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully updated Shedule",
            data:result
        })
    }
)


export const sheduleController={
    createSchedule,
    getAllShedule,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}