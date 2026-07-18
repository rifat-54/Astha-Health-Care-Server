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


export const specialtyController={
    createSpecialty
}