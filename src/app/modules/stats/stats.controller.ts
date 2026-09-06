import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { statsServices } from "./stats.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";


const getDashboardStatsData=catchAsync(
    async(req:Request,res:Response)=>{
        const result=await statsServices.getDashboardStatsData(req.user)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully get stats data",
            data:result
        })
    }
)


export const statsController={
    getDashboardStatsData
}