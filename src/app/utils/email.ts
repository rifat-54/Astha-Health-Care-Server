import nodemailer from "nodemailer"
import { envVeriable } from "../config/env"
import path from "path"

import ejs from "ejs"
import AppError from "../errorHelpers/AppError"
import status from "http-status"


const transporter=nodemailer.createTransport({
    host:envVeriable.EMAIL_SENDER.SMTP_HOST,
    secure:true,
    auth:{
        user:envVeriable.EMAIL_SENDER.SMTP_USER,
        pass:envVeriable.EMAIL_SENDER.SMTP_PASS
    },
    port:Number(envVeriable.EMAIL_SENDER.SMTP_PORT)
})

interface SendEmailOptions{
    to:string,
    subject:string,
    templateName:string,
    templateDate:Record<string,any>,
    attachments?:{
        filename:string,
        content:Buffer | string,
        contentType:string
    }[]
}

export const sendEmail=async({subject,templateDate,templateName,to,attachments}:SendEmailOptions)=>{
    try {
        const templaetPath=path.resolve(process.cwd(),`src/app/templates/${templateName}.ejs`)

        const html=await ejs.renderFile(templaetPath,templateDate)

        const info=await transporter.sendMail({
            from:envVeriable.EMAIL_SENDER.SMTP_FROM,
            to:to,
            subject:subject,
            html:html,
            attachments:attachments?.map((attachment)=>({
                filename:attachment.filename,
                content:attachment.content,
                contentType:attachment.contentType
            }))
        })

        console.log(`Email sent to ${to}:${info.messageId}`)
    } catch (error:any) {
        console.log("Email sending error",error.message)
        throw new AppError(status.INTERNAL_SERVER_ERROR,"Failed to send email")
    }
}