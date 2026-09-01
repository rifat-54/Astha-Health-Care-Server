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

const getAllPrescription=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user
        
        const result=await prescriptiionServices.getAllPrescription()

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"All Prescription fetch successfully",
            data:result
        })
    }
)

const updatePrescription=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const prescriptionId=req.params.id as string
        
        const result=await prescriptiionServices.updatePrescription(user,prescriptionId,req.body)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Prescription updated successfully",
            data:result
        })
    }
)

const deletePrescription=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const prescriptionId=req.params.id as string
        
        const result=await prescriptiionServices.deletePrescription(user,prescriptionId)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Prescription deleted successfully",
            data:result
        })
    }
)


export const prescriptionController={
    givePrescription,
    myPrescription,
    getAllPrescription,
    updatePrescription,
    deletePrescription
}