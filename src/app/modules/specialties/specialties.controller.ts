import { Request, Response } from "express";
import { SpecialtyServices } from "./specialties.services";
import { catchAsync } from "../../shared/catchAsync";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await SpecialtyServices.createSpecialty(payload);
  res.status(201).json({ message: "Created", data: result });
});

const getAllSpecialty = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtyServices.getAllSpecialty();
  res.status(201).json({
    success: true,
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await SpecialtyServices.deleteSpecialty(id);
  res.status(200).json({ success: true, data: result });
});

export const specialtyController = {
  createSpecialty,
  getAllSpecialty,
  deleteSpecialty,
};
