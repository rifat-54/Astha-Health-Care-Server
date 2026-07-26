import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

const doctorUpdateValidationZodSehema = z.object({
  doctor: z.object({
    name: z.string().optional(),
    profilePhoto: z.url("invalid url format").optional(),
    contactNumber: z
      .string()
      .min(11, "contact number must be at least 11 digit")
      .max(15, "contact number must be at most 15 digit")
      .optional(),
    experience: z
      .int("Experience must be an integer numbert")
      .min(0, "Experience cannot be negative")
      .optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
    appointmentFee: z
      .number()
      .positive("appointment fee myst be positive")
      .optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
  }),
  doctorSpecialties:z.array(z.uuid("Each specialty Id must be a valid UUID")).optional()
});


export const doctorValidation={
    doctorUpdateValidationZodSehema
}