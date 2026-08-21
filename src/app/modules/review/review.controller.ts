import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { reviewServices } from "./review.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const giveReview=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const result=await reviewServices.giveReview(user,req.body)

        sendResponse(res,{
            httpStatusCode:status.CREATED,
            success:true,
            message:"Successfully review created",
            data:result
        })
    }
)


export const reviewController={
    giveReview
}