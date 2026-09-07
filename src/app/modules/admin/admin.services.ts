import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { IChangeUserRolePayload, IChangeUserStatusPayload, IUpdateAdminPayload } from "./admin.interface";
import { IRequestUser } from "../../interface/requestUser.interface";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";


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

const changeUserStatus=async(user:IRequestUser,payload:IChangeUserStatusPayload)=>{
    // role 1. super admin can change any user status expect himself
    // role 2.admin can change patient and doctor status only

    const isAdminExists=await prisma.admin.findUniqueOrThrow({
        where:{
            userId:user.userId
        }
    })

    const{userId,status:userStatus}=payload

    const changeToUser=await prisma.user.findUniqueOrThrow({
        where:{
            id:userId
        }
    })

    if(user.userId===userId){
        throw new AppError(status.BAD_REQUEST,"You cannot change your own status")
    }

    if(user.role===UserRole.ADMIN &&(changeToUser.role===UserRole.ADMIN || changeToUser.role===UserRole.SUPER_ADMIN)){
        throw new AppError(status.BAD_REQUEST,"You cannot change amdin and super admin status")
    }

    if(userStatus===UserStatus.DELETED){
        throw new AppError(status.BAD_REQUEST,"You cannot set user staus to deleted")
    }

    const updateUser=await prisma.user.update({
        where:{
            id:userId
        },
        data:{
            status:userStatus
        }
    })

    return updateUser
}


const changeUserRole=async(user:IRequestUser,payload:IChangeUserRolePayload)=>{
    const isSuperAdminExists=await prisma.admin.findUniqueOrThrow({
        where:{
            email:user.email,
            user:{
                role:UserRole.SUPER_ADMIN
            }
        }
    })

    const {userId,role}=payload

    const changeToUser=await prisma.user.findUniqueOrThrow({
        where:{
            id:userId
        }
    })

    if(user.userId===userId){
        throw new AppError(status.BAD_REQUEST,"You cannot update your own role")
    }

    if(changeToUser.role===UserRole.PATIENT || changeToUser.role===UserRole.DOCTOR){
        throw new AppError(status.BAD_REQUEST,"You can't update doctor and patient role")
    }

    const updatedUser=await prisma.user.update({
        where:{
            id:userId
        },
        data:{
            role
        }
    })

    return updatedUser

}

export const adminServices={
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole
}