import { Request } from "express";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";


export const deleteUploadFilesFromGlobalErrorHandler=async(req:Request)=>{
    try {
        const filesToDelete:string[]=[]

        console.log("from delete uploaded file from flobal error ->",req .files)
        if(req.file && req.file?.path){
            filesToDelete.push(req.file?.path)

        }else if(req.files && typeof req.files==="object" && !Array.isArray(req.files)){
            const data=Object.values(req.files)
            console.log("first",data)

            Object.values(req.files).forEach(fileArray=>{
                if(Array.isArray(fileArray)){
                    fileArray.forEach(file=>{
                        if(file.path){
                            filesToDelete.push(file.path)
                        }
                    })
                }
            })

        } else if(req.files && Array.isArray(req.files) && req.files.length>0){

            req.files.forEach(file=>{
                if(file.path){
                    filesToDelete.push(file.path)
                }
            })

            
    }

    if(filesToDelete.length>0){
                await Promise.all(
                    filesToDelete.map(url=>deleteFileFromCloudinary(url))
                )
            }

            console.log(`Deleted ${filesToDelete.length} uploaded files form cloudinary due to an error during request processing`)

        

    } catch (error:any) {
        console.error("Error deleting uploaded file from global error handler",error)
    }
}