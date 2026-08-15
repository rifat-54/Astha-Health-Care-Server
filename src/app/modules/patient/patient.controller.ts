import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { patientServices } from "./patient.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";


const updatePatientProfile=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user;
        const payload=req.body;

        const result=await patientServices.updatePatientProfile(user,payload)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Profile updated successfully",
            data:result
        })
    }
)

export const patientController={
    updatePatientProfile
}