import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminServices } from "./admin.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllAdmin=catchAsync(
    async(req:Request,res:Response)=>{
        const result=await adminServices.getAllAdmin()


        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"successfully fetch all admin",
            data:result
        })
    }
)

const getAdminById=catchAsync(
    async(req:Request,res:Response)=>{
        const id=req.params.id as string
        const result=await adminServices.getAdminById(id)


        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"successfully fetch admin",
            data:result
        })
    }
)


const updateAdmin=catchAsync(
    async(req:Request,res:Response)=>{
        const id=req.params.id as string

        
        const result=await adminServices.updateAdmin(id,req.body)


        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"successfully update admin",
            data:result
        })
    }
)


export  const adminController={
    getAllAdmin,
    getAdminById,
    updateAdmin
}