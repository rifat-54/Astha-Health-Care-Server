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

const getDoctorById=catchAsync(
    async(req:Request,res:Response)=>{
        const id=req.params.id as string
        const result=await doctorServices.getDoctorById(id)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Single doctor data",
            data:result
        })
    }
)


const updateDoctor=catchAsync(
    async(req:Request,res:Response)=>{
        const id=req.params.id as string

        // console.log(req.body)
        const result=await doctorServices.updateDoctor(id,req.body)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Doctor updated successfylly",
            data:result
        })
    }
)

export const doctorController={
    getAllDoctors,
    getDoctorById,
    updateDoctor
}