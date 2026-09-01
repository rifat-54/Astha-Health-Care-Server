import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { prescriptiionServices } from "./prescription.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const givePrescription=catchAsync(
    async(req:Request,res:Response)=>{
        const payload=req.body;
        const user=req.user
        
        const result=await prescriptiionServices.givePrescription(user,payload)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Prescription created successfully",
            data:result
        })
    }
)

const myPrescription=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user
        
        const result=await prescriptiionServices.myPrescription(user)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Prescription fetch successfully",
            data:result
        })
    }
)


export const prescriptionController={
    givePrescription,
    myPrescription
}