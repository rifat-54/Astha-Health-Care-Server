import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sheduleServices } from "./schedule.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

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


export const sheduleController={
    createSchedule
}