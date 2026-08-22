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

const getAllReview=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const result=await reviewServices.getAllReview()

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully fetched all review",
            data:result
        })
    }
)

const myReview=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user

        const result=await reviewServices.myReview(user)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully fetched my all review",
            data:result
        })
    }
)

const updateReview=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user
        const reviewId=req.params.id as string
        const payload=req.body

        const result=await reviewServices.updateReview(user,reviewId,payload)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully updaed review",
            data:result
        })
    }
)

const deleteReview=catchAsync(
    async(req:Request,res:Response)=>{
        const user=req.user
        const reviewId=req.params.id as string

        const result=await reviewServices.deleteReview(user,reviewId)

        sendResponse(res,{
            httpStatusCode:status.OK,
            success:true,
            message:"Successfully deleted review",
            data:result
        })
    }
)


export const reviewController={
    giveReview,
    getAllReview,
    myReview,
    updateReview,
    deleteReview
}