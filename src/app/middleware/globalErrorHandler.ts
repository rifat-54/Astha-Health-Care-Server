import { NextFunction, Request, Response } from "express";
import { envVeriable } from "../config/env";
import status from "http-status";
import z, { success } from "zod";
import { handleZodError } from "../errorHelpers/handleZodError";
import { IErrorSources } from "../interface/error.interface";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { deleteUploadFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";


export const globalErrorHandler=async(err:any,req:Request,res:Response,next:NextFunction)=>{
    if(envVeriable.NODE_ENV==="development"){
        console.log("Error from Global Error Handler",err)
    }

    // delete file from cloudinary

    // if(req.file){
    //     await deleteFileFromCloudinary(req.file.path)
    // }

    // // delete multiple file from cloudinary

    // if(req.files && Array.isArray(req.files) && req.files.length>0){
    //     const imageUrls=req.files.map((file)=>file.path)

    //     await Promise.all(imageUrls.map((url)=>deleteFileFromCloudinary(url)))
    // }

     console.log("🔥 GLOBAL ERROR HANDLER CALLED");

    await deleteUploadFilesFromGlobalErrorHandler(req)
    
    console.log("🔥 DELETE FUNCTION FINISHED");


    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';
    let stack:string | undefined=undefined

    let errorSources:IErrorSources[]=[]

    if(err instanceof z.ZodError){
      const simpliedError= handleZodError(err)
      statusCode=simpliedError.statusCode as number;
      message=simpliedError.message
      errorSources=[...simpliedError.errorSources!]
      stack=err.stack
    }else if(err instanceof AppError){
        statusCode=err.statusCode;
        message=err.message;
        stack=err.stack;
        errorSources=[
            {
                path:"",
                message:err.message
            }
        ]
    }else if(err instanceof Error){
        statusCode=status.INTERNAL_SERVER_ERROR;
        message=err.message;
        stack=err.stack;
        errorSources=[
            {
                path:"",
                message:err.message
            }
        ]
    }

    const errorResponse={
        success:false,
        message:message,
        errorSources,
        error:envVeriable.NODE_ENV==="development"?err:undefined,
        stack:envVeriable.NODE_ENV==="development" ? stack :undefined
    }

    res.status(statusCode).json(errorResponse)
}