import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { IUpdateAdminPayload } from "./admin.interface";


const getAllAdmin=async()=>{
    const result=await prisma.admin.findMany({
        include:{
            user:true
        }
    })

    return result;
}


const getAdminById=async(id:string)=>{
    const result=await prisma.admin.findUnique({
        where:{
            id
        },
        include:{
            user:true
        }
    })

    return result;
}

const updateAdmin=async(id:string,payload:IUpdateAdminPayload)=>{

    console.log("called admni servercies=>",payload)

    const isAdminExists=await prisma.admin.findUnique({
        where:{
            id
        }
    })

    if(!isAdminExists){
        throw new AppError(status.NOT_FOUND,"admin not found")
    }


    const {admin}=payload

    console.log("admin",admin)

    const result=await prisma.admin.update({
        where:{
            id
        },
        data:{
            ...admin
        }
    })

    return result;
}



export const adminServices={
    getAllAdmin,
    getAdminById,
    updateAdmin
}