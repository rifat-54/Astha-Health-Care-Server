import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { IUpdateAdminPayload } from "./admin.interface";
import { IRequestUser } from "../../interface/requestUser.interface";
import { UserStatus } from "../../../generated/prisma/enums";


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

const deleteAdmin=async(id:string,user:IRequestUser)=>{

    const isAdminExists=await prisma.admin.findUnique({
        where:{
            id
        }
    })

    if(!isAdminExists){
        throw new AppError(status.NOT_FOUND,"admin not found")
    }

    if(isAdminExists.userId===user.userId){
        throw new AppError(status.BAD_REQUEST,"You cannot delete yourself")
    }

    if(isAdminExists.isDeleted){
        throw new AppError(status.BAD_REQUEST,"Admin is already deleted")
    }

    const result=await prisma.$transaction(async(tx)=>{

        await tx.admin.update({
            where:{
                id
            },
            data:{
                isDeleted:true,
                deletedAt:new Date()
            }
        })

        await tx.user.update({
            where:{
                id:isAdminExists.userId
            },
            data:{
                isDeleted:true,
                deletedAt:new Date(),
                status:UserStatus.DELETED
            }
        })

        // delete all session

        await tx.session.deleteMany({
            where:{
                userId:isAdminExists.userId
            }
        })


        // delete account
        await tx.account.deleteMany({
            where:{
                userId:isAdminExists.userId
            }
        })


        // return current admin data
        const admin=await getAdminById(id)

        return admin;
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
    updateAdmin,
    deleteAdmin
}