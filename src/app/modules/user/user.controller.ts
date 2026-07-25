import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserServices } from "./user.services";
import status from "http-status";

const createDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        console.log("create doctor",payload)

        const result = await UserServices.createDoctor(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Doctor registered successfully",
            data: result,
        })
    }
)

const createAdmin=catchAsync(
    async(req:Request,res:Response)=>{
        const payload=req.body;

        const result=await UserServices.createAdmin(payload)

        console.log("result-> ",result)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Admin Created Successfully",
            data:result
        })
    }
)

const createSuperAdmin=catchAsync(
    async(req:Request,res:Response)=>{
        const payload=req.body;

        const result=await UserServices.createSuperAdmin(payload)

        // console.log("result-> ",result)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Super Admin Created Successfully",
            data:result
        })
    }
)

export const userControler={
    createDoctor,
    createAdmin,
    createSuperAdmin
}