import { NextFunction, Request, Response, Router } from "express";
import { userControler } from "./user.controller";
import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

const router = Router();

const createDoctorZodSchema = z.object({
  password: z
    .string("password is required")
    .min(5, "password at least 5 character")
    .max(20, "password must be at most 20 character"),
  doctor: z.object({
    name: z
      .string("Name is required and must be string")
      .min(5, "Name must be at least 5 characters")
      .max(30, "Name must be at most 30 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact number must be at least 11 character")
      .max(14, "Contact number must be at most 14 character"),
    address: z
      .string("Address is required")
      .min(10, "Address must be at least 10 characters")
      .max(100, "Address must be at most 100 characters")
      .optional(),
    registrationNumber: z.string("Registration number is required"),
    experience: z
      .int("Experience must be integer")
      .nonnegative("Experience cannot be negative")
      .optional(),
    gender: z.enum(
      [Gender.FEMALE, Gender.MALE],
      "Gender must be male or female",
    ),
    appointmentFee: z
      .number("Appointment fee must be a number")
      .nonnegative("appointment fee cannot be negative"),
    qualification: z
      .string("Qualification is required")
      .min(2, "Qualification must be at least 2 characters")
      .max(50, "Qualification must be at most 50 characters"),
    currentWorkingPlace: z
      .string("Current working place is required")
      .min(2, "Current working place must be at least 2 characters")
      .max(50, "Current working place must be at most 50 characters"),
    designation: z
      .string("Designation is required")
      .min(2, "Designation must be at least 2 characters")
      .max(50, "Designation must be at most 50 characters"),
  }),
  doctorSpecialties:z.array(z.uuid(),"Specialty must be an array of strings").min(1,"at least one specialty is required")
});

router.post("/create-doctor",(req:Request,res:Response,next:NextFunction)=>{

    console.log("before zod -> ",req.body)
    const parseResult=createDoctorZodSchema.safeParse(req.body)
    if(!parseResult.success){
        console.log(parseResult.error)
        next(parseResult.error)
    }

    req.body=parseResult.data

    console.log("after zod -> ",req.body)

    next()

}, userControler.createDoctor);

export const userRoutes = router;
