import { Request, Response } from "express";
import { SpecialtyServices } from "./specialties.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await SpecialtyServices.createSpecialty(payload);
    sendResponse(res,{
    httpStatusCode:201,
    success:true,
    message:"Created data",
    data:result
  })
});

const getAllSpecialty = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtyServices.getAllSpecialty();
  sendResponse(res,{
    httpStatusCode:200,
    success:true,
    message:"Feched data",
    data:result
  })
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await SpecialtyServices.deleteSpecialty(id);
   sendResponse(res,{
    httpStatusCode:200,
    success:true,
    message:"Deleted data",
    data:result
  })
});

export const specialtyController = {
  createSpecialty,
  getAllSpecialty,
  deleteSpecialty,
};
