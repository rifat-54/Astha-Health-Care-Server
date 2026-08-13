import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVeriable } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { paymentServices } from "./payment.services";
import { sendResponse } from "../../shared/sendResponse";


const handleStripeWebhookEvent=catchAsync(
    async(req:Request,res:Response)=>{
        const signature=req.headers['stripe-signature']
        const webhookSecret=envVeriable.STRIPE.STRIPE_WEBHOOK_SECRET

        if(!signature || !webhookSecret){
            console.error("Missing Stripe signature or webhook secret")
            return res.status(status.BAD_REQUEST).json({messsage:"Missing Stripe signature or webhook secret"})
        }

        let event;

        try {
            event=stripe.webhooks.constructEvent(req.body,signature,webhookSecret)
        } catch (error) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(status.BAD_REQUEST).json({message : "Error processing Stripe webhook"})
        }

        try {
            const result=await paymentServices.handleStripeWebhookEvent(event)

            sendResponse(res,{
                httpStatusCode:status.OK,
                success:true,
                message:"Stripe webhook event processed successfully",
                data:result
            })
        } catch (error) {
            console.error("Error handling stripe webhook event:",error)

            sendResponse(res,{
                httpStatusCode:status.INTERNAL_SERVER_ERROR,
                success:false,
                message:"Error handling stripe webhook event"
            })
        }
    }
)

export const paymentController={
    handleStripeWebhookEvent
}