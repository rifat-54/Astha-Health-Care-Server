import status from "http-status";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { Gender, UserRole } from "../../../generated/prisma/enums";
import { Specialty } from "../../../generated/prisma/client";

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
            throw new Error(`Spealty with id ${specialtyId} not found`)
        }
        specialties.push(specialty)
    }

    const userExists=await prisma.user.findUnique({
        where:{
            email:payload.doctor.email
        }
    })

    if(userExists){
        throw new Error("User with this email already exit")
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



export const UserServices={
    createDoctor
}