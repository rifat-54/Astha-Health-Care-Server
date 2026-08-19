import { NextFunction, Request, RequestHandler, Response } from "express"

export const catchAsync=(fn:RequestHandler)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        try {
            await fn(req,res,next)
        } catch (error:any) {
            console.log("catchAsync caught error",error)
            // res.status(error.statusCode|| 500).json({
            //     success:false,
            //     message:error.message || "Something went wrong",
            //     stack:error.stack,
            //     error:error
            // })

            next(error)

        }
    }
}