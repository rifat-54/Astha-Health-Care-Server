import { NextFunction, Request, Response } from "express";
import { envVeriable } from "../config/env";
import status from "http-status";
import z, { success } from "zod";
import { handleZodError } from "../errorHelpers/handleZodError";
import { IErrorSources } from "../interface/error.interface";


export const globalErrorHandler=async(err:any,req:Request,res:Response,next:NextFunction)=>{
    if(envVeriable.NODE_ENV==="development"){
        console.log("Error from Global Error Handler",err)
    }
    
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';

    let errorSources:IErrorSources[]=[]

    if(err instanceof z.ZodError){
      const simpliedError= handleZodError(err)
      message=simpliedError.message
      errorSources=[...simpliedError.errorSources!]
    }

    const errorResponse={
        success:false,
        message:message,
        errorSources,
        error:envVeriable.NODE_ENV==="devlopment"?err:undefined
    }

    res.status(statusCode).json(errorResponse)
}