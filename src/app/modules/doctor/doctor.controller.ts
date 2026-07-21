import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { doctorServices } from "./doctor.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllDoctors=catchAsync(async(req:Request,res:Response)=>{
    const result=await doctorServices.getAllDoctors()

    sendResponse(res,{
        httpStatusCode:status?.OK,
        success:true,
        message:"All Doctor",
        data:result
    })
})

export const doctorController={
    getAllDoctors
}