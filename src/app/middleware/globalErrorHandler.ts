import { NextFunction, Request, Response } from "express";
import { envVeriable } from "../config/env";
import status from "http-status";


export const globalErrorHandler=async(err:any,req:Request,res:Response,next:NextFunction)=>{
    if(envVeriable.NODE_ENV==="development"){
        console.log("Error from Global Error Handler")
    }
    
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';

    res.status(statusCode).json({
        success:false,
        message,
        err
    })
}