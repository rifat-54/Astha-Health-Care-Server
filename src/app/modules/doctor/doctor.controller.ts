import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { doctorServices } from "./doctor.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interface/query.interface";

const getAllDoctors=catchAsync(async(req:Request,res:Response)=>{
    const query=req.query as IQueryParams
    const result=await doctorServices.getAllDoctors(query)

    sendResponse(res,{
        httpStatusCode:status?.OK,
        success:true,
        message:"All Doctor",
        data:result.data,
        meta:result.meta
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

const softDeleteDoctor=catchAsync(
    async(req:Request,res:Response)=>{
        const id=req.params.id as string
        const result=await doctorServices.softDeleteDoctor(id)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Doctor deleted successfully",
            data:result
        })
    }
)

export const doctorController={
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    softDeleteDoctor
}