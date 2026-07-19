
import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


const createSpecialty=async(payload:Specialty):Promise<Specialty>=>{

    const specialty=await prisma.specialty.create({
        data:payload
    })

    return specialty;
}


const getAllSpecialty=async()=>{
    const result=await prisma.specialty.findMany()

    return result
}

const deleteSpecialty=async(id:string)=>{
    const result=await prisma.specialty.delete({
        where:{
            id
        }
    })

    return result;
}

export const SpecialtyServices={
    createSpecialty,
    getAllSpecialty,
    deleteSpecialty
}