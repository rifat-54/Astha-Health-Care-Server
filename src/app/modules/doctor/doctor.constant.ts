import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = ['name', 'email', 'qualification', 'designation', 'currentWorkingPlace', 'registrationNumber', 'doctorSpecilaties.specialty.title'];

export const doctorFilterableFields = ['gender', 'isDeleted', 'appointmentFee', 'experience', 'registrationNumber', 'specialties.specialtyId', 'currentWorkingPlace', 'designation', 'qualification', 'doctorSpecilaties.specialty.title', 'user.role'];

export const doctorIncludeConfig : Partial<Record<keyof Prisma.DoctorInclude, Prisma.DoctorInclude[keyof Prisma.DoctorInclude]>> ={
    user: true,
    doctorSpecilaties: {
        include:{
            specialty: true
        }
    },
    appointments: {
        include: {
            patient: true,
            doctor: true,

        }
    },
    doctorSchedule: {
        include: {
            schedule: true
        }
    },
    prescription: true,
    review: true,
}