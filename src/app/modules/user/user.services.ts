import status from "http-status";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { Gender, UserRole } from "../../../generated/prisma/enums";
import { Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { ICreateAdmin } from "./user.interface";

interface ICreateDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        registrationNumber: string;
        experience?: number;
        gender: Gender;
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string;
    }
    doctorSpecialties: string[];
}



// const createDoctor = async (payload: ICreateDoctorPayload) => {

//     const specialties: Specialty[] = [];

//     for (const specialtyId of payload.doctorSpecialties) {
//         const specialty = await prisma.specialty.findUnique({
//             where: {
//                 id: specialtyId
//             }
//         })
//         if (!specialty) {
//             // throw new Error(`Specialty with id ${specialtyId} not found`);
//             throw new Error( `Specialty with id ${specialtyId} not found`);
//         }
//         specialties.push(specialty);
//     }


//     const userExists = await prisma.user.findUnique({
//         where: {
//             email: payload.doctor.email
//         }
//     })

//     if (userExists) {
//         // throw new Error("User with this email already exists");
//         // throw new Error(status.CONFLICT, "User with this email already exists");
//         throw new Error("User with this email already exists");
//     }

//     const userData = await auth.api.signUpEmail({
//         body: {
//             email: payload.doctor.email,
//             password: payload.password,
//             role: UserRole.DOCTOR,
//             name: payload.doctor.name,
//             needPasswordChange: true,
//         }
//     })


//     try {
//         const result = await prisma.$transaction(async (tx) => {
//             const doctorData = await tx.doctor.create({
//                 data: {
//                     userId: userData.user.id,
//                     ...payload.doctor,
//                 }
//             })

//             const doctorSpecialtyData = specialties.map((specialty) => {
//                 return {
//                     doctorId: doctorData.id,
//                     specialtyId: specialty.id,
//                 }
//             })

//             await tx.doctorSpecialty.createMany({
//                 data: doctorSpecialtyData
//             })

//             const doctor = await tx.doctor.findUnique({
//                 where: {
//                     id: doctorData.id
//                 },
//                 select: {
//                     id: true,
//                     userId: true,
//                     name: true,
//                     email: true,
//                     profilePhoto: true,
//                     contactNumber: true,
//                     address: true,
//                     registrationNumber: true,
//                     experience: true,
//                     gender: true,
//                     appointmentFee: true,
//                     qualification: true,
//                     currentWorkingPlace: true,
//                     designation: true,
//                     createdAt: true,
//                     updatedAt: true,
//                     user: {
//                         select: {
//                             id: true,
//                             email: true,
//                             name: true,
//                             role: true,
//                             status: true,
//                             emailVerified: true,
//                             image: true,
//                             isDeleted: true,
//                             deletedAt: true,
//                             createdAt: true,
//                             updatedAt: true,
//                         }
//                     },
//                     doctorSpecilaties: {
//                         select: {
//                             specialty: {
//                                 select: {
//                                     title: true,
//                                     id: true
//                                 }
//                             }
//                         }
//                     }
//                 }
//             })

//             return doctor;

//         })

//         return result;
//     } catch (error) {
//         console.log("Transaction error : ", error);
//         await prisma.user.delete({
//             where: {
//                 id: userData.user.id
//             }
//         })
//         throw error;
//     }
// }

const createDoctor=async(payload:ICreateDoctorPayload)=>{
    const specialties:Specialty[]=[]

    for(const specialtyId of payload.doctorSpecialties){
        const specialty=await prisma.specialty.findUnique({
        where:{
                id:specialtyId
            }
        })
        if(!specialty){
            throw new AppError(status.NOT_FOUND,`Spealty with id ${specialtyId} not found`)
        }
        specialties.push(specialty)
    }

    const userExists=await prisma.user.findUnique({
        where:{
            email:payload.doctor.email
        }
    })

    if(userExists){
        throw new AppError(status.SERVICE_UNAVAILABLE,"User with this email already exit")
    }

    const userData=await auth.api.signUpEmail({
        body:{
            email:payload.doctor.email,
            password:payload.password,
            role:UserRole.DOCTOR,
            name:payload.doctor.name,
            needPasswordChange:true
        }
    })

    try {
        const result=await prisma.$transaction(async(tx)=>{
            const doctorData=await tx.doctor.create({
                data:{
                    userId:userData.user.id,
                    ...payload.doctor
                }
            })

            const doctorSpecialtyData=specialties.map((specialty)=>{
                return {
                    doctorId:doctorData.id,
                    specialtyId:specialty.id
                }
            })

            await tx.doctorSpecialty.createMany({
                data:doctorSpecialtyData
            })

            const doctor=await tx.doctor.findUnique({
                where:{
                    id:doctorData.id
                },
                select:{
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    createdAt: true,
                    updatedAt: true,
                    user:{
                        select:{
                            id:true,
                            email:true,
                            name:true,
                            role:true,
                            status:true,
                            emailVerified:true,
                            image:true,
                            isDeleted:true,
                            deletedAt:true,
                            createdAt:true,
                            updatedAt:true
                        }
                    },
                    doctorSpecilaties:{
                        select:{
                            specialty:{
                                select:{
                                    title:true,
                                    id:true
                                }
                            }
                        }
                    }
                }
            })

            return doctor;
        })
        return result;
    } catch (error) {
        console.log("transation error",error)
        await prisma.user.delete({
            where:{
                id:userData.user.id
            }
        })
        throw error;
    }

}

const createAdmin=async(payload:ICreateAdmin)=>{
    console.log("admin data",payload)
    const userExists=await prisma.user.findUnique({
        where:{
            email:payload.admin.email
        }
    })

    if(userExists){
        throw new Error("User with this email already exists")
    }

    // step 2: Create user account with better auth
    const userData=await auth.api.signUpEmail({
        body:{
            email:payload.admin.email,
            password:payload.password,
            role:UserRole.ADMIN,
            name:payload.admin.name,
            needPasswordChange:true,
            rememberMe:false
        }
    })

    // step 3: create admin profile with transaction
    try {
        const result=await prisma.$transaction(async(tx)=>{
            // create admin record
            const admin=await tx.admin.create({
                data:{
                    userId:userData.user.id,
                    name:payload.admin.name,
                    email:payload.admin.email,
                    profilePhoto:payload.admin.profilePhoto,
                    contactNumber:payload.admin.contactNumber
                }
            })

            // fetch admin data
            const createdAdmin=await tx.admin.findUnique({
                where:{
                    id:admin.id
                },
                include:{
                    user:true
                }
            })

            return createdAdmin;

        })

        return result;

    } catch (error) {
        // Cleanup: Delete user from db if admin creation fail
        await prisma.user.delete({
            where:{
                id:userData.user.id
            }
        })

        throw new AppError(status.INTERNAL_SERVER_ERROR,"failed to cread admin")
    }

}

const createSuperAdmin=async(payload:ICreateAdmin)=>{
    console.log("super admin data",payload)
    const userExists=await prisma.user.findUnique({
        where:{
            email:payload.admin.email
        }
    })

    if(userExists){
        throw new Error("User with this email already exists")
    }

    // step 2: Create user account with better auth
    const userData=await auth.api.signUpEmail({
        body:{
            email:payload.admin.email,
            password:payload.password,
            role:UserRole.SUPER_ADMIN,
            name:payload.admin.name,
            needPasswordChange:true,
            rememberMe:false
        }
    })

    // step 3: create admin profile with transaction
    try {
        const result=await prisma.$transaction(async(tx)=>{
            // create admin record
            const admin=await tx.admin.create({
                data:{
                    userId:userData.user.id,
                    name:payload.admin.name,
                    email:payload.admin.email,
                    profilePhoto:payload.admin.profilePhoto,
                    contactNumber:payload.admin.contactNumber
                }
            })

            // fetch admin data
            const createdAdmin=await tx.admin.findUnique({
                where:{
                    id:admin.id
                },
                include:{
                    user:true
                }
            })

            return createdAdmin;

        })

        return result;

    } catch (error) {
        // Cleanup: Delete user from db if admin creation fail
        await prisma.user.delete({
            where:{
                id:userData.user.id
            }
        })

        throw new AppError(status.INTERNAL_SERVER_ERROR,"failed to cread Super admin")
    }

}



export const UserServices={
    createDoctor,
    createAdmin,
    createSuperAdmin
}