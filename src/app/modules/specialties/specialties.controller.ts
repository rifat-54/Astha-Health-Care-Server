import { Request, Response } from "express";
import { SpecialtyServices } from "./specialties.services";

const createSpecialty=async(req:Request,res:Response)=>{
    try {
        const payload=req.body
        const result=await SpecialtyServices.createSpecialty(payload)
        res.status(201).json({message:"Created",data:result})
    } catch (error) {
        
    }
}

const getAllSpecialty=async(req:Request,res:Response)=>{
    try {
        const result =await SpecialtyServices.getAllSpecialty()
        res.status(200).json({success:true,data:result})
    } catch (error) {
        
    }
}

const deleteSpecialty=async(req:Request,res:Response)=>{
    try {
        const id=req.params.id as string
        const result=await SpecialtyServices.deleteSpecialty(id)
        res.status(200).json({success:true,data:result})
    } catch (error) {
        
    }
}


export const specialtyController={
    createSpecialty,
    getAllSpecialty,
    deleteSpecialty
}