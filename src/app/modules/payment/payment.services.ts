import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";


const handleStripeWebhookEvent=async(event:Stripe.Event)=>{
    const existingPayment=await prisma.payment.findFirst({
        where:{
            stripeEvenId:event.id
        }
    })

    if(existingPayment){
        console.log(`Event ${event.id} already processed. Skipping`);
        return {message : `Event ${event.id} already processed. Skipping`}
    }

    switch(event.type){
        case "checkout.session.completed":{
            const session=event.data.object

            const appointmentId=session.metadata?.appointmentId
            const paymentId=session.metadata?.paymentId

            if(!appointmentId || !paymentId){
                console.error("Missing appointmentId or paymentId in session metadata");
                return {message : "Missing appointmentId or paymentId in session metadata"}
            }

            const appointment=await prisma.$transaction(async(tx)=>{
                await tx.appointment.update({
                    where:{
                        id:appointmentId
                    },
                    data:{
                        paymentStatus:session.payment_status==="paid"?PaymentStatus.PAID:PaymentStatus.UNPAID
                    }
                })

                await tx.payment.update({
                    where:{
                        id:paymentId
                    },
                    data:{
                        stripeEvenId:event.id,
                        status:session.payment_status==="paid"?PaymentStatus.PAID:PaymentStatus.UNPAID,
                        paymentGatewayData:session as any
                    }
                })

            })

            console.log(`Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`)
            break;
        }
        case "checkout.session.expired":{
            const session=event.data.object

            console.log(`Checkout session ${session.id} expired.Marking associated payment as failed`)
            break
        }
        case "payment_intent.payment_failed":{
             const session=event.data.object

            console.log(`Checkout session ${session.id} expired.Marking associated payment as failed`)
            break
        }
        default:{
        console.log(`Unhandled event type ${event.type}`)
        }

    }

    return {message:`Webhook Event ${event.id} processed successfully`}
}


export const paymentServices={
    handleStripeWebhookEvent
}